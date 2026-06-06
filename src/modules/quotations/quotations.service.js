import prisma from '../../config/db.js';

export const getAllQuotations = async (filters = {}) => {
  const where = {};
  if (filters.vendorId) {
    where.vendorId = filters.vendorId;
  }
  if (filters.rfqId) {
    where.rfqId = filters.rfqId;
  }

  return prisma.quotation.findMany({
    where,
    include: {
      rfq: { select: { id: true, title: true } },
      vendor: { select: { id: true, name: true, rating: true, paymentTerms: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getQuotationById = async (id, vendorIdFilter = null) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      rfq: {
        include: {
          items: true,
        },
      },
      vendor: true,
      items: {
        include: {
          rfqItem: true,
        },
      },
      approvalWorkflow: {
        include: {
          actions: {
            include: {
              actor: { select: { id: true, name: true, role: true } },
            },
          },
        },
      },
    },
  });

  if (!quotation) return null;

  if (vendorIdFilter && quotation.vendorId !== vendorIdFilter) {
    throw new Error('Forbidden: You cannot access this quotation');
  }

  return quotation;
};

export const submitQuotation = async (data, vendorId, userId) => {
  const { rfqId, deliveryDays, taxRate, terms, items } = data;

  // 1. Verify vendor is invited to the RFQ
  const invitation = await prisma.rFQVendor.findUnique({
    where: {
      rfqId_vendorId: { rfqId, vendorId },
    },
  });

  if (!invitation) {
    throw new Error('Forbidden: Your company is not invited to submit a quotation for this RFQ');
  }

  // 2. Verify RFQ deadline is not passed
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: { items: true },
  });

  if (!rfq) {
    throw new Error('RFQ not found');
  }

  if (new Date() > new Date(rfq.deadline)) {
    throw new Error('Submission failed: The deadline for this RFQ has already passed');
  }

  // 3. Compute pricing logic via transaction
  return prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const itemData = [];

    for (const item of items) {
      const rfqItem = rfq.items.find((i) => i.id === item.rfqItemId);
      if (!rfqItem) {
        throw new Error(`Invalid line item reference: item ID ${item.rfqItemId} not in RFQ`);
      }

      const totalPrice = item.unitPrice * rfqItem.quantity;
      subtotal += totalPrice;

      itemData.push({
        rfqItemId: item.rfqItemId,
        unitPrice: item.unitPrice,
        totalPrice,
      });
    }

    const totalAmount = subtotal * (1 + taxRate / 100);

    const quotation = await tx.quotation.create({
      data: {
        rfqId,
        vendorId,
        deliveryDays,
        taxRate,
        terms,
        totalAmount,
        status: 'PENDING',
        items: {
          create: itemData,
        },
      },
      include: {
        items: true,
      },
    });

    // Write immutable audit log
    await tx.auditLog.create({
      data: {
        action: 'QUOTE_SUBMITTED',
        userId,
        details: JSON.stringify({ quotationId: quotation.id, rfqId, totalAmount }),
      },
    });

    return quotation;
  });
};

// --- Quotation Comparison Business Logic (Screen 7) ---
export const getQuotationsComparison = async (rfqId) => {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: { items: true },
  });

  if (!rfq) {
    throw new Error('RFQ not found');
  }

  const quotations = await prisma.quotation.findMany({
    where: { rfqId },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          rating: true,
          paymentTerms: true,
        },
      },
      items: {
        include: {
          rfqItem: true,
        },
      },
    },
  });

  if (quotations.length === 0) {
    return { rfq, quotations: [] };
  }

  // Identify the quotation with the lowest total amount
  let lowestAmount = Infinity;
  let lowestQuotationId = null;

  quotations.forEach((quote) => {
    if (quote.totalAmount < lowestAmount) {
      lowestAmount = quote.totalAmount;
      lowestQuotationId = quote.id;
    }
  });

  const comparison = quotations.map((quote) => ({
    id: quote.id,
    vendorId: quote.vendorId,
    vendorName: quote.vendor.name,
    vendorRating: quote.vendor.rating,
    paymentTerms: quote.vendor.paymentTerms,
    deliveryDays: quote.deliveryDays,
    taxRate: quote.taxRate,
    totalAmount: quote.totalAmount,
    status: quote.status,
    isLowestPrice: quote.id === lowestQuotationId,
    items: quote.items.map((item) => ({
      rfqItemId: item.rfqItemId,
      itemName: item.rfqItem.itemName,
      quantity: item.rfqItem.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
  }));

  return { rfq, quotations: comparison };
};

// --- Selection Business Logic (Screen 7 select quotation -> initiates approvals workflow) ---
export const selectQuotationForApproval = async (quotationId, userId) => {
  return prisma.$transaction(async (tx) => {
    const quotation = await tx.quotation.findUnique({
      where: { id: quotationId },
      include: { rfq: true },
    });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    if (quotation.rfq.status !== 'PUBLISHED' && quotation.rfq.status !== 'UNDER_REVIEW') {
      throw new Error(`Cannot select quotation for RFQ with status: ${quotation.rfq.status}`);
    }

    // 1. Update RFQ status to UNDER_REVIEW
    await tx.rFQ.update({
      where: { id: quotation.rfqId },
      data: { status: 'UNDER_REVIEW' },
    });

    // 2. Clear out any previous approval workflows for this RFQ (to allow reset)
    await tx.approvalWorkflow.deleteMany({
      where: { rfqId: quotation.rfqId },
    });

    // 3. Create active Approval Workflow starting at L1_PENDING (Procurement Head)
    const workflow = await tx.approvalWorkflow.create({
      data: {
        rfqId: quotation.rfqId,
        quotationId: quotation.id,
        currentStep: 'L1_PENDING',
      },
    });

    // 4. Update selected quotation status
    await tx.quotation.update({
      where: { id: quotationId },
      data: { status: 'PENDING' }, // Keep as pending review
    });

    // 5. Write audit log
    await tx.auditLog.create({
      data: {
        action: 'RFQ_QUOTE_SELECTED',
        userId,
        details: JSON.stringify({ rfqId: quotation.rfqId, quotationId, workflowId: workflow.id }),
      },
    });

    return workflow;
  });
};

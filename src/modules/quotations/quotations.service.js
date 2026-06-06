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
      vendor: { select: { id: true, name: true } },
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

    // Create a new Approval Workflow for this quotation
    await tx.approvalWorkflow.create({
      data: {
        rfqId,
        quotationId: quotation.id,
        currentStep: 'L1_PENDING',
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

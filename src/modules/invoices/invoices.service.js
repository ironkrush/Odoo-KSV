import prisma from '../../config/db.js';

export const getAllInvoices = async (filters = {}) => {
  const where = {};
  if (filters.vendorId) {
    where.vendorId = filters.vendorId;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.invoice.findMany({
    where,
    include: {
      po: { select: { id: true, poNumber: true } },
      vendor: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getInvoiceById = async (id, vendorIdFilter = null) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      po: true,
      vendor: true,
    },
  });

  if (!invoice) return null;

  if (vendorIdFilter && invoice.vendorId !== vendorIdFilter) {
    throw new Error('Forbidden: You cannot access this invoice');
  }

  return invoice;
};

export const createInvoice = async (data, vendorId, userId) => {
  const { invoiceNumber, poId, invoiceDate, dueDate, totalAmount } = data;

  // Verify PO exists and belongs to this vendor
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
  });

  if (!po) {
    throw new Error('Purchase Order not found');
  }

  if (po.vendorId !== vendorId) {
    throw new Error('Forbidden: This Purchase Order is not assigned to your company');
  }

  const existingInvoice = await prisma.invoice.findUnique({
    where: { invoiceNumber },
  });

  if (existingInvoice) {
    throw new Error('Invoice number already exists');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Create invoice
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        poId,
        vendorId,
        invoiceDate,
        dueDate,
        status: 'PENDING_PAYMENT',
        totalAmount,
      },
    });

    // 2. Mark PO as COMPLETED
    await tx.purchaseOrder.update({
      where: { id: poId },
      data: { status: 'COMPLETED' },
    });

    // 3. Write immutable audit log
    await tx.auditLog.create({
      data: {
        action: 'INVOICE_SUBMITTED',
        userId,
        details: JSON.stringify({ invoiceId: invoice.id, invoiceNumber, poId, totalAmount }),
      },
    });

    return invoice;
  });
};

export const updateInvoiceStatus = async (id, status, userId) => {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.update({
      where: { id },
      data: { status },
    });

    // Write immutable audit log
    await tx.auditLog.create({
      data: {
        action: 'INVOICE_STATUS_UPDATED',
        userId,
        details: JSON.stringify({ invoiceId: id, status }),
      },
    });

    return invoice;
  });
};

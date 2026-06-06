import prisma from '../../config/db.js';

export const getAllPos = async (filters = {}) => {
  const where = {};
  if (filters.vendorId) {
    where.vendorId = filters.vendorId;
  }

  return prisma.purchaseOrder.findMany({
    where,
    include: {
      rfq: { select: { id: true, title: true } },
      vendor: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPoById = async (id, vendorIdFilter = null) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      rfq: {
        include: {
          items: true,
        },
      },
      quotation: {
        include: {
          items: {
            include: {
              rfqItem: true,
            },
          },
        },
      },
      vendor: true,
      invoices: true,
    },
  });

  if (!po) return null;

  if (vendorIdFilter && po.vendorId !== vendorIdFilter) {
    throw new Error('Forbidden: You cannot access this PO');
  }

  return po;
};

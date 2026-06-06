import prisma from '../../config/db.js';

export const getAllRfqs = async (filters = {}) => {
  const where = {};
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.category) {
    where.category = filters.category;
  }

  // If filtered for a specific vendor
  if (filters.vendorId) {
    where.invitedVendors = {
      some: {
        vendorId: filters.vendorId,
      },
    };
  }

  return prisma.rFQ.findMany({
    where,
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getRfqById = async (id, vendorIdFilter = null) => {
  const rfq = await prisma.rFQ.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      items: true,
      invitedVendors: {
        include: {
          vendor: { select: { id: true, name: true, category: true } },
        },
      },
      quotations: {
        include: {
          vendor: { select: { id: true, name: true } },
          items: true,
        },
      },
    },
  });

  if (!rfq) return null;

  // If vendor filter is active, check if vendor is invited
  if (vendorIdFilter) {
    const isInvited = rfq.invitedVendors.some((iv) => iv.vendorId === vendorIdFilter);
    if (!isInvited) {
      throw new Error('Forbidden: You are not invited to this RFQ');
    }
  }

  return rfq;
};

export const createRfq = async (data, creatorId) => {
  const { title, category, deadline, description, invitedVendorIds, items } = data;

  // Use a transaction to create RFQ, Items, and Vendor relations
  return prisma.$transaction(async (tx) => {
    const rfq = await tx.rFQ.create({
      data: {
        title,
        category,
        deadline,
        description,
        status: 'PUBLISHED',
        createdById: creatorId,
        items: {
          create: items.map((item) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
          })),
        },
        invitedVendors: {
          create: invitedVendorIds.map((vendorId) => ({
            vendorId,
          })),
        },
      },
      include: {
        items: true,
        invitedVendors: true,
      },
    });

    // Write immutable audit log
    await tx.auditLog.create({
      data: {
        action: 'RFQ_CREATED',
        userId: creatorId,
        details: JSON.stringify({ rfqId: rfq.id, title: rfq.title, invitedVendorsCount: invitedVendorIds.length }),
      },
    });

    return rfq;
  });
};

export const updateRfqStatus = async (id, status, userId) => {
  return prisma.$transaction(async (tx) => {
    const rfq = await tx.rFQ.update({
      where: { id },
      data: { status },
    });

    await tx.auditLog.create({
      data: {
        action: 'RFQ_STATUS_UPDATED',
        userId,
        details: JSON.stringify({ rfqId: id, status }),
      },
    });

    return rfq;
  });
};

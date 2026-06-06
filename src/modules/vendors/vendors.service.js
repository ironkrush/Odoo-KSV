import prisma from '../../config/db.js';

export const getAllVendors = async (filters = {}) => {
  const where = {};
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { email: { contains: filters.search } },
      { gstNo: { contains: filters.search } },
    ];
  }

  return prisma.vendor.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

export const getVendorById = async (id) => {
  return prisma.vendor.findUnique({
    where: { id },
    include: { users: { select: { id: true, email: true, name: true, role: true } } },
  });
};

export const createVendor = async (data) => {
  const existingVendor = await prisma.vendor.findFirst({
    where: {
      OR: [
        { gstNo: data.gstNo },
        { email: data.email },
      ],
    },
  });

  if (existingVendor) {
    throw new Error('Vendor with this GST number or Email already exists');
  }

  return prisma.vendor.create({ data });
};

export const updateVendor = async (id, data) => {
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) {
    throw new Error('Vendor not found');
  }

  return prisma.vendor.update({
    where: { id },
    data,
  });
};

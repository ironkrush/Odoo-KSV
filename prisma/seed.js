import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing tables (order matters due to foreign keys)
  await prisma.auditLog.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.approvalAction.deleteMany({});
  await prisma.approvalWorkflow.deleteMany({});
  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.rFQVendor.deleteMany({});
  await prisma.rFQItem.deleteMany({});
  await prisma.rFQ.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.vendor.deleteMany({});

  console.log('🧹 Cleaned existing database tables.');

  // 2. Create Vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'TechCore Ltd',
      category: 'IT Hardware',
      gstNo: '24AAAAA1111A1Z1',
      contactNo: '9876543210',
      status: 'ACTIVE',
      email: 'sales@techcore.com',
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      name: 'Infra Supplies Pvt Ltd',
      category: 'Furniture',
      gstNo: '24BBBBB2222B2Z2',
      contactNo: '8765432109',
      status: 'ACTIVE',
      email: 'contracts@infrasupplies.com',
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      name: 'FastLog Transport',
      category: 'Logistics',
      gstNo: '24CCCCC3333C3Z3',
      contactNo: '7654321098',
      status: 'PENDING',
      email: 'info@fastlog.com',
    },
  });

  console.log('🏢 Created mock Vendor profiles.');

  // 3. Create Users with encrypted password hashes
  const passwordHash = await bcrypt.hash('password123', 10);

  const officer = await prisma.user.create({
    data: {
      email: 'officer@vendorbridge.com',
      name: 'Sarah Procurement',
      passwordHash,
      role: 'PROCUREMENT_OFFICER',
    },
  });

  const approver1 = await prisma.user.create({
    data: {
      email: 'approver1@vendorbridge.com',
      name: 'John Reviewer L1',
      passwordHash,
      role: 'APPROVER_L1',
    },
  });

  const approver2 = await prisma.user.create({
    data: {
      email: 'approver2@vendorbridge.com',
      name: 'Priya Manager L2',
      passwordHash,
      role: 'APPROVER_L2',
    },
  });

  // Link Vendor users to their respective Vendor entities
  await prisma.user.create({
    data: {
      email: 'vendor1@techcore.com',
      name: 'Alex TechCore Sales',
      passwordHash,
      role: 'VENDOR',
      vendorId: vendor1.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'vendor2@infrasupplies.com',
      name: 'Bob Infra Supplies Sales',
      passwordHash,
      role: 'VENDOR',
      vendorId: vendor2.id,
    },
  });

  console.log('👤 Created User profiles for all roles (Officer, Approvers, and Vendors).');

  // 4. Create a baseline RFQ
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 14); // 2 weeks from now

  const rfq = await prisma.rFQ.create({
    data: {
      title: 'Office Furniture procurement Q2',
      category: 'Furniture',
      deadline,
      description: 'Request for ergonomic chairs and standing desks for the Ahmedabad regional office.',
      status: 'PUBLISHED',
      createdById: officer.id,
      items: {
        create: [
          { itemName: 'Ergonomic chairs', quantity: 25, unit: 'pcs' },
          { itemName: 'Standing desks', quantity: 10, unit: 'pcs' },
        ],
      },
      invitedVendors: {
        create: [
          { vendorId: vendor1.id },
          { vendorId: vendor2.id },
        ],
      },
    },
  });

  console.log('📝 Created initial active RFQ.');

  // 5. Log audit trail
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_SEED',
      userId: officer.id,
      details: 'Initial system seeding completed with mock user, vendor, and RFQ records.',
    },
  });

  console.log('✨ Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

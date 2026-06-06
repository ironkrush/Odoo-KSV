import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with approval chain roles...');

  // 1. Clean existing tables
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

  // 2. Create Vendors with extra fields
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'TechCore Ltd',
      category: 'IT Hardware',
      gstNo: '24AAAAA1111A1Z1',
      contactNo: '9876543210',
      status: 'ACTIVE',
      email: 'sales@techcore.com',
      address: '102, Silicon Square, C.G. Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380009',
      panNo: 'ABCDE1234F',
      bankName: 'State Bank of India',
      bankAccNo: '33344455566',
      ifscCode: 'SBIN0001234',
      website: 'https://techcore.com',
      paymentTerms: 'Net 30',
      rating: 4.8,
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
      address: '405, Industrial Hub, Ichhapore',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '394510',
      panNo: 'FGHIJ5678K',
      bankName: 'HDFC Bank',
      bankAccNo: '5010005556667',
      ifscCode: 'HDFC0001234',
      website: 'https://infrasupplies.com',
      paymentTerms: 'Net 45',
      rating: 4.5,
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
      address: 'Shop 12, Transport Nagar',
      city: 'Vadodara',
      state: 'Gujarat',
      pincode: '390001',
      panNo: 'LMNOP9012Z',
      bankName: 'ICICI Bank',
      bankAccNo: '629000111222',
      ifscCode: 'ICIC0006290',
      website: 'https://fastlog.com',
      paymentTerms: 'Net 15',
      rating: 4.0,
    },
  });

  console.log('🏢 Created mock Vendor profiles.');

  // 3. Create Users with approval chain designations
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin User
  await prisma.user.create({
    data: {
      email: 'admin@vendorbridge.com',
      name: 'System Admin',
      passwordHash,
      role: 'ADMIN',
      phone: '9900112233',
      department: 'IT Administration',
      designation: 'SysAdmin Manager',
      approvalLimit: 9999999.0,
    },
  });

  // Sarah Procurement (PROCUREMENT_OFFICER)
  const officer = await prisma.user.create({
    data: {
      email: 'officer@vendorbridge.com',
      name: 'Sarah Procurement',
      passwordHash,
      role: 'PROCUREMENT_OFFICER',
      phone: '9898012345',
      department: 'Corporate Procurement',
      designation: 'Senior Procurement Officer',
      approvalLimit: 50000.0,
    },
  });

  // Rahul Mehta (PROCUREMENT_HEAD)
  await prisma.user.create({
    data: {
      email: 'head@vendorbridge.com',
      name: 'Rahul Mehta',
      passwordHash,
      role: 'PROCUREMENT_HEAD',
      phone: '9898056789',
      department: 'Procurement Management',
      designation: 'Procurement Head',
      approvalLimit: 250000.0,
    },
  });

  // Priya Shah (FINANCE_MANAGER)
  await prisma.user.create({
    data: {
      email: 'finance@vendorbridge.com',
      name: 'Priya Shah',
      passwordHash,
      role: 'FINANCE_MANAGER',
      phone: '9898098765',
      department: 'Finance and Accounts',
      designation: 'Finance Manager',
      approvalLimit: 1000000.0,
    },
  });

  // Link Vendor users to their respective Vendor entities
  await prisma.user.create({
    data: {
      email: 'vendor1@techcore.com',
      name: 'Alex TechCore Sales',
      passwordHash,
      role: 'VENDOR',
      phone: '9797012345',
      department: 'Enterprise Sales',
      designation: 'Account Manager',
      vendorId: vendor1.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'vendor2@infrasupplies.com',
      name: 'Bob Infra Supplies Sales',
      passwordHash,
      role: 'VENDOR',
      phone: '9797056789',
      department: 'Business Development',
      designation: 'BDE Executive',
      vendorId: vendor2.id,
    },
  });

  console.log('👤 Created User profiles matching Rahul Mehta (Head), Priya Shah (Finance Manager), Sarah, and Vendors.');

  // 4. Create a baseline RFQ
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 14); // 2 weeks from now

  const rfq = await prisma.rFQ.create({
    data: {
      title: 'office furniture Q2',
      category: 'Furniture',
      deadline,
      description: 'Request for ergonomic chairs and standing desks for Ahmedabad office.',
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
      details: 'Baseline database seeding completed with core roles and active RFQ.',
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

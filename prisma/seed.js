import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with extended metadata...');

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

  console.log('🏢 Created mock Vendor profiles with address, bank, and rating details.');

  // 3. Create Users with extra fields
  const passwordHash = await bcrypt.hash('password123', 10);

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

  const approver1 = await prisma.user.create({
    data: {
      email: 'approver1@vendorbridge.com',
      name: 'John Reviewer L1',
      passwordHash,
      role: 'APPROVER_L1',
      phone: '9898056789',
      department: 'Finance and Operations',
      designation: 'Financial Reviewer L1',
      approvalLimit: 150000.0,
    },
  });

  const approver2 = await prisma.user.create({
    data: {
      email: 'approver2@vendorbridge.com',
      name: 'Priya Manager L2',
      passwordHash,
      role: 'APPROVER_L2',
      phone: '9898098765',
      department: 'Executive Administration',
      designation: 'VP of Operations L2',
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

  console.log('👤 Created User profiles with phone, department, designation, and approvalLimit details.');

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
      details: 'Extended system seeding completed with mock user, vendor, and RFQ records.',
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

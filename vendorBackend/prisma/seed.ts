import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Clearing database...');
    await prisma.notification.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.quotation.deleteMany();
    await prisma.rFQ.deleteMany();
    await prisma.user.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.organization.deleteMany();

    console.log('Seeding database...');

    // 1. Create Organization
    const org = await prisma.organization.create({
      data: { name: 'KSV Group' },
    });

    // 2. Hash Passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const officerPassword = await bcrypt.hash('procure123', salt);
    const managerPassword = await bcrypt.hash('manage123', salt);
    const vendorPassword = await bcrypt.hash('vendor123', salt);

    // 3. Create Users
    await prisma.user.create({
      data: {
        fullName: 'Admin User',
        email: 'admin@vendorbridge.com',
        password: adminPassword,
        role: 'Admin',
        organizationId: org.id,
      },
    });

    await prisma.user.create({
      data: {
        fullName: 'Procurement Officer',
        email: 'procurement@vendorbridge.com',
        password: officerPassword,
        role: 'Procurement Officer',
        organizationId: org.id,
      },
    });

    await prisma.user.create({
      data: {
        fullName: 'Shaban Approver',
        email: 'manager@vendorbridge.com',
        password: managerPassword,
        role: 'Manager / Approver',
        organizationId: org.id,
      },
    });

    // 4. Create Vendors
    const vendorsData = [
      { id: 'VND-301', name: 'Global Logistics LLC', category: 'Logistics', rating: 4.9, status: 'Active', email: 'ops@globallogistics.com', phone: '+123456789', gst: '22AAAAA1111A1Z1' },
      { id: 'VND-302', name: 'Apex Industrial Supplies', category: 'Industrial Supplies', rating: 4.7, status: 'Active', email: 'sales@apexsupplies.net', phone: '+123456780', gst: '22BBBBB2222B2Z2' },
      { id: 'VND-303', name: 'Summit Raw Materials', category: 'Raw Materials', rating: 4.5, status: 'Active', email: 'procure@summitraw.org', phone: '+123456781', gst: '22CCCCC3333C3Z3' },
      { id: 'VND-304', name: 'NextGen Parts Ltd', category: 'Electronics', rating: 4.2, status: 'Onboarding', email: 'info@nextgenparts.co', phone: '+123456782', gst: '22DDDDD4444D4Z4' },
      { id: 'VND-305', name: 'Weston Packaging', category: 'Packaging', rating: 3.8, status: 'Inactive', email: 'contact@westonpack.com', phone: '+123456783', gst: '22EEEEE5555E5Z5' },
    ];

    for (const v of vendorsData) {
      const dbVendor = await prisma.vendor.create({
        data: {
          id: v.id,
          name: v.name,
          category: v.category,
          rating: v.rating,
          status: v.status,
          contactEmail: v.id === 'VND-302' ? (process.env.VENDOR_EMAIL || v.email) : v.email,
          contactPhone: v.phone,
          gstNumber: v.gst,
          organizationId: org.id,
        },
      });

      // Assign the test vendor user to VND-302 (Apex Industrial Supplies)
      if (v.id === 'VND-302') {
        await prisma.user.create({
          data: {
            fullName: `${v.name} Contact`,
            email: process.env.VENDOR_EMAIL || 'vendor@vendorbridge.com',
            password: vendorPassword,
            role: 'Vendor',
            organizationId: org.id,
            vendorId: dbVendor.id,
          },
        });
      } else {
        await prisma.user.create({
          data: {
            fullName: `${v.name} Agent`,
            email: v.email,
            password: vendorPassword,
            role: 'Vendor',
            organizationId: org.id,
            vendorId: dbVendor.id,
          },
        });
      }
    }

    // 5. Create RFQs
    const rfqsData = [
      { id: '102', title: 'Custom Steel Fabrication', vendorCategory: 'Industrial Supplies', status: 'Sent', itemsCount: 15, desc: 'Fabrication of grade-5 steel support frames for warehouse structure.', deadline: '2026-06-20', vendors: 'Apex Industrial Supplies, NextGen Parts Ltd', fileUrl: 'https://example.com/steel-specs.pdf' },
      { id: '103', title: 'Raw Rubber Shipments', vendorCategory: 'Raw Materials', status: 'Sent', itemsCount: 40, desc: '40 metric tons of raw natural latex rubber in sealed drums.', deadline: '2026-06-18', vendors: 'Summit Raw Materials', fileUrl: '' },
      { id: '104', title: 'Corrugated Packaging Boxes', vendorCategory: 'Packaging', status: 'Received', itemsCount: 120, desc: 'Custom corrugated boxes, dual-wall cardboard, with print layout.', deadline: '2026-06-15', vendors: 'Apex Industrial Supplies', fileUrl: 'https://example.com/box-layout.png' },
      { id: '105', title: 'High-Temp Wiring Harnesses', vendorCategory: 'Electronics', status: 'Closed', itemsCount: 25, desc: 'Wiring harnesses rated up to 150C for industrial machine assembly.', deadline: '2026-05-30', vendors: 'NextGen Parts Ltd', fileUrl: '' },
    ];

    for (const r of rfqsData) {
      await prisma.rFQ.create({
        data: {
          id: r.id,
          title: r.title,
          vendorCategory: r.vendorCategory,
          status: r.status,
          itemsCount: r.itemsCount,
          description: r.desc,
          deadline: r.deadline,
          assignedVendors: r.vendors,
          attachmentUrl: r.fileUrl,
          organizationId: org.id,
        },
      });
    }

    // 6. Create Quotations
    const quotationsData = [
      { id: 'QT-812', rfqId: '104', vendorId: 'VND-302', vendorName: 'Apex Industrial Supplies', amount: 8400, deliveryTimeDays: 5, status: 'Pending Review', notes: 'Includes shipping, packaging box dimensions as per spec sheet.' },
      { id: 'QT-813', rfqId: '102', vendorId: 'VND-301', vendorName: 'Global Logistics LLC', amount: 12450, deliveryTimeDays: 14, status: 'Pending Review', notes: 'Bidding on freight/logistics routing elements of custom fabrication shipment.' },
      { id: 'QT-814', rfqId: '103', vendorId: 'VND-303', vendorName: 'Summit Raw Materials', amount: 35000, deliveryTimeDays: 30, status: 'Approved', notes: 'Standard raw rubber drums, direct import. Price locked for 30 days.' },
      { id: 'QT-815', rfqId: '102', vendorId: 'VND-304', vendorName: 'NextGen Parts Ltd', amount: 11900, deliveryTimeDays: 7, status: 'Rejected', notes: 'NextGen custom fabrication. Delivery timeframe is guaranteed.' },
    ];

    for (const q of quotationsData) {
      await prisma.quotation.create({
        data: {
          id: q.id,
          rfqId: q.rfqId,
          vendorId: q.vendorId,
          vendorName: q.vendorName,
          amount: q.amount,
          deliveryTimeDays: q.deliveryTimeDays,
          status: q.status,
          notes: q.notes,
          organizationId: org.id,
        },
      });
    }

    // 7. Create Purchase Orders
    const posData = [
      { id: '#PO-1004', rfqId: '102', vendorId: 'VND-302', vendorName: 'Apex Industrial Supplies', product: 'Structural Steel Beams', qty: 150, unitPrice: 85.0, status: 'Delivered' },
      { id: '#PO-1003', rfqId: '102', vendorId: 'VND-303', vendorName: 'Summit Raw Materials', product: 'Grade 5 Titanium Rods', qty: 45, unitPrice: 320.0, status: 'In Transit' },
      { id: '#PO-1002', rfqId: '104', vendorId: 'VND-302', vendorName: 'Apex Industrial Supplies', product: 'Corrugated Shipping Boxes', qty: 1000, unitPrice: 1.2, status: 'Pending Approval' },
      { id: '#PO-1001', rfqId: '105', vendorId: 'VND-304', vendorName: 'NextGen Parts Ltd', product: 'Microcontroller Units', qty: 500, unitPrice: 4.5, status: 'Cancelled' },
    ];

    for (const p of posData) {
      const subtotal = p.qty * p.unitPrice;
      const taxAmount = subtotal * 0.18;
      const total = subtotal + taxAmount;

      await prisma.purchaseOrder.create({
        data: {
          id: p.id,
          rfqId: p.rfqId,
          vendorId: p.vendorId,
          vendorName: p.vendorName,
          product: p.product,
          qty: p.qty,
          unitPrice: p.unitPrice,
          subtotal,
          taxAmount,
          total,
          status: p.status,
          organizationId: org.id,
        },
      });
    }

    // 8. Create Invoices
    const invoicesData = [
      { id: 'INV-928', poId: '#PO-1004', vendorName: 'Apex Industrial Supplies', amount: 12750.0, status: 'Paid' },
      { id: 'INV-929', poId: '#PO-1003', vendorName: 'Summit Raw Materials', amount: 14400.0, status: 'Pending' },
      { id: 'INV-930', poId: '#PO-1004', vendorName: 'Apex Industrial Supplies', amount: 12750.0, status: 'Overdue' },
    ];

    for (const i of invoicesData) {
      const subtotal = i.amount;
      const taxAmount = subtotal * 0.18;
      const total = subtotal + taxAmount;

      await prisma.invoice.create({
        data: {
          id: i.id,
          poId: i.poId,
          vendorName: i.vendorName,
          amount: total,
          subtotal,
          taxAmount,
          totalAmount: total,
          status: i.status,
          organizationId: org.id,
        },
      });
    }

    // 9. Create Activity Logs
    const activitiesData = [
      { type: 'po', title: 'Purchase Order #PO-1004 state cleared', detail: 'Apex Industrial Supplies material release logged as Delivered.' },
      { type: 'po', title: 'Purchase Order #PO-1003 shipment initialized', detail: 'Grade 5 Titanium Rods routed for transit clearance.' },
      { type: 'rfq', title: 'New RFQ established for supplies', detail: 'Corrugated Packaging Boxes request finalized & sent to packaging vendors.' },
      { type: 'invoice', title: 'Vendor Apex Industrial Supplies invoice paid', detail: 'Financial ledger clearance of $15,045.00 posted.' },
    ];

    for (const a of activitiesData) {
      await prisma.activityLog.create({
        data: {
          type: a.type,
          title: a.title,
          detail: a.detail,
          organizationId: org.id,
        },
      });
    }

    console.log('Database successfully seeded.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

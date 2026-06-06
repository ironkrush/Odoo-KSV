import { Router, Response } from 'express';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import prisma from '../../db.js';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.js';

const router = Router();

// Helper to generate Invoice PDF buffer
const generateInvoicePDF = (invoice: any, po: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      // Header Brand
      doc.fontSize(24).fillColor('#000000').text('VendorBridge ERP', 50, 50);
      doc.fontSize(10).fillColor('#666666').text('Procurement & Supply Chain Solutions', 50, 78);
      
      // Invoice Heading
      doc.fontSize(20).fillColor('#000000').text('INVOICE', 400, 50, { align: 'right' });
      doc.fontSize(9).fillColor('#555555').text(`Invoice Ref: ${invoice.id}`, 400, 78, { align: 'right' });
      doc.text(`Date Issued: ${new Date(invoice.createdAt).toLocaleDateString()}`, 400, 92, { align: 'right' });
      
      // Horizontal Line
      doc.moveTo(50, 115).lineTo(550, 115);
      doc.strokeColor('#dedede');
      doc.lineWidth(1);
      doc.stroke();

      // Billing and Supplier details
      doc.fontSize(10).fillColor('#888888').text('INVOICED TO:', 50, 140);
      doc.fontSize(11).fillColor('#000000').text(invoice.vendorName, 50, 155);
      doc.fontSize(9).fillColor('#555555').text('Purchase Organization Hub', 50, 170);
      doc.text(`Associated PO ID: ${invoice.poId}`, 50, 185);

      // Status
      doc.fontSize(10).fillColor('#888888').text('PAYMENT STATUS:', 400, 140);
      doc.fontSize(12).fillColor(invoice.status === 'Paid' ? '#047857' : invoice.status === 'Overdue' ? '#be123c' : '#b45309').text(invoice.status.toUpperCase(), 400, 155);

      // Horizontal Line
      doc.moveTo(50, 215).lineTo(550, 215);
      doc.strokeColor('#dedede');
      doc.lineWidth(1);
      doc.stroke();

      // Product details
      doc.fontSize(10).fillColor('#888888').text('ITEM DESCRIPTION', 50, 235);
      doc.text('QTY', 350, 235, { width: 50, align: 'right' });
      doc.text('RATE', 420, 235, { width: 50, align: 'right' });
      doc.text('SUBTOTAL', 490, 235, { width: 60, align: 'right' });

      let currentY = 260;
      if (po) {
        doc.fontSize(10).fillColor('#000000').text(po.product, 50, currentY);
        doc.text(po.qty.toString(), 350, currentY, { width: 50, align: 'right' });
        doc.text(`$${po.unitPrice.toFixed(2)}`, 420, currentY, { width: 50, align: 'right' });
        doc.text(`$${po.subtotal.toFixed(2)}`, 490, currentY, { width: 60, align: 'right' });
        currentY += 30;
      } else {
        doc.fontSize(10).fillColor('#000000').text('Standard Procurement Materials Batch Delivery', 50, currentY);
        doc.text('1', 350, currentY, { width: 50, align: 'right' });
        doc.text(`$${invoice.subtotal.toFixed(2)}`, 420, currentY, { width: 50, align: 'right' });
        doc.text(`$${invoice.subtotal.toFixed(2)}`, 490, currentY, { width: 60, align: 'right' });
        currentY += 30;
      }

      // Divider
      doc.moveTo(50, currentY).lineTo(550, currentY);
      doc.strokeColor('#efefef');
      doc.lineWidth(1);
      doc.stroke();
      currentY += 15;

      // Summary
      doc.fontSize(9).fillColor('#666666').text('Subtotal Amount:', 400, currentY, { width: 80, align: 'left' });
      doc.fontSize(9).fillColor('#000000').text(`$${invoice.subtotal.toFixed(2)}`, 490, currentY, { width: 60, align: 'right' });
      currentY += 20;

      doc.fontSize(9).fillColor('#666666').text('GST Tax (18%):', 400, currentY, { width: 80, align: 'left' });
      doc.fontSize(9).fillColor('#000000').text(`$${invoice.taxAmount.toFixed(2)}`, 490, currentY, { width: 60, align: 'right' });
      currentY += 20;

      doc.moveTo(400, currentY).lineTo(550, currentY);
      doc.strokeColor('#dedede');
      doc.lineWidth(1);
      doc.stroke();
      currentY += 10;

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000').text('Total Invoiced:', 400, currentY, { width: 80, align: 'left' });
      doc.text(`$${invoice.totalAmount.toFixed(2)}`, 490, currentY, { width: 60, align: 'right' });
      doc.font('Helvetica');

      // Footer
      doc.fontSize(8).fillColor('#888888').text('Thank you for your business. For any compliance or tax invoice inquiries, email ops@vendorbridge.com', 50, 700, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// Mail Transporter Setup
const getTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass }
    });
  } else {
    // Ethereal mock fallback
    console.log('No SMTP config found in .env. Initializing mock Ethereal mailer account.');
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
};

// List all invoices
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    if (req.user!.role === 'Vendor') {
      // Vendors only see their own invoices
      const invoices = await prisma.invoice.findMany({
        where: {
          organizationId: orgId || undefined,
          vendorName: req.user!.fullName.replace(' Contact', '').replace(' Agent', ''),
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(invoices);
    } else {
      const invoices = await prisma.invoice.findMany({
        where: { organizationId: orgId || undefined },
        orderBy: { createdAt: 'desc' },
      });
      res.json(invoices);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create Invoice
router.post('/', authenticate, authorize(['Admin', 'Procurement Officer']), async (req: AuthRequest, res: Response) => {
  try {
    const { poId, vendorName, amount, status } = req.body;
    if (!poId || !vendorName || !amount) {
      res.status(400).json({ error: 'PO ID, Vendor entity, and invoiced amount are required.' });
      return;
    }

    const customId = `INV-${Math.floor(931 + Math.random() * 1000)}`;
    const orgId = req.user!.organizationId!;

    const subtotal = Number(amount);
    const taxAmount = subtotal * 0.18; // 18% GST Tax calculation
    const totalAmount = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        id: customId,
        poId,
        vendorName,
        amount: totalAmount,
        subtotal,
        taxAmount,
        totalAmount,
        status: status || 'Pending',
        organizationId: orgId,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'invoice',
        title: `Vendor Invoice ${customId} recorded`,
        detail: `Invoiced subtotal: $${subtotal}, GST: $${taxAmount}, Total: $${totalAmount} recorded against PO ${poId}.`,
        organizationId: orgId,
      },
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Stream PDF
router.get('/:id/pdf', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    // Attempt to fetch purchase order
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: invoice.poId }
    });

    const pdfBuffer = await generateInvoicePDF(invoice, po);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send PDF via Email
router.post('/:id/email', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { emailRecipient } = req.body;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: invoice.poId }
    });

    // Determine recipient: body recipient -> logged-in user email -> default info
    const recipient = emailRecipient || req.user!.email;

    // Generate the PDF
    const pdfBuffer = await generateInvoicePDF(invoice, po);

    // Get transporter
    const transporter = await getTransporter();
    
    const mailOptions = {
      from: process.env.SENDER_EMAIL || '"VendorBridge ERP" <no-reply@vendorbridge.com>',
      to: recipient,
      subject: `[VendorBridge] Invoice ${invoice.id} Payment Clearance Request`,
      text: `Hello,\n\nPlease find attached the tax invoice ${invoice.id} for $${invoice.totalAmount.toFixed(2)} generated against Purchase Order reference ${invoice.poId}.\n\nBest Regards,\nProcurement Team`,
      attachments: [
        {
          filename: `Invoice-${invoice.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    const testUrl = nodemailer.getTestMessageUrl(info);

    // Write activity log
    await prisma.activityLog.create({
      data: {
        type: 'invoice',
        title: `Invoice ${invoice.id} emailed`,
        detail: `Sent to ${recipient}. ${testUrl ? `Test Preview URL: ${testUrl}` : 'Dispatched via SMTP.'}`,
        organizationId: req.user!.organizationId!,
      },
    });

    // Create database notification for Procurement Officer
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        message: `Invoice ${invoice.id} has been emailed to ${recipient}.`
      }
    });

    // Notify the vendor contact user if they exist
    const vendorRecord = await prisma.vendor.findFirst({
      where: { name: invoice.vendorName }
    });
    if (vendorRecord) {
      const vendorUser = await prisma.user.findFirst({
        where: { vendorId: vendorRecord.id }
      });
      if (vendorUser) {
        await prisma.notification.create({
          data: {
            userId: vendorUser.id,
            message: `Invoice ${invoice.id} has been emailed to you (${recipient}).`
          }
        });
      }
    }

    res.json({
      message: `Invoice successfully emailed to ${recipient}`,
      messageId: info.messageId,
      previewUrl: testUrl || undefined
    });
  } catch (error: any) {
    console.error('Email error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

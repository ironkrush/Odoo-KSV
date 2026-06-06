import { Router, Response } from 'express';
import prisma from '../../db.js';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.js';

const router = Router();

// Get all quotations
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    // Vendors only see their own quotations
    if (req.user!.role === 'Vendor') {
      const quotations = await prisma.quotation.findMany({
        where: {
          organizationId: orgId || undefined,
          vendorId: req.user!.vendorId || '',
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(quotations);
    } else {
      const quotations = await prisma.quotation.findMany({
        where: { organizationId: orgId || undefined },
        orderBy: { createdAt: 'desc' },
      });
      res.json(quotations);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit a quotation (Vendor only)
router.post('/', authenticate, authorize(['Vendor']), async (req: AuthRequest, res: Response) => {
  try {
    const { rfqId, amount, deliveryTimeDays, notes } = req.body;
    if (!rfqId || !amount || !deliveryTimeDays) {
      res.status(400).json({ error: 'RFQ ID, amount, and delivery timeframe are required.' });
      return;
    }

    const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId } });
    if (!rfq) {
      res.status(400).json({ error: 'RFQ not found.' });
      return;
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: req.user!.vendorId || '' } });
    if (!vendor) {
      res.status(400).json({ error: 'Logged in user is not mapped to any Vendor record.' });
      return;
    }

    const customId = `QT-${Math.floor(816 + Math.random() * 200)}`;
    const orgId = req.user!.organizationId!;

    const quotation = await prisma.quotation.create({
      data: {
        id: customId,
        rfqId,
        vendorId: vendor.id,
        vendorName: vendor.name,
        amount: Number(amount),
        deliveryTimeDays: Number(deliveryTimeDays),
        status: 'Pending Review',
        notes,
        organizationId: orgId,
      },
    });

    // Update RFQ status to 'Received' to signify bids are coming in
    if (rfq.status === 'Sent') {
      await prisma.rFQ.update({
        where: { id: rfqId },
        data: { status: 'Received' }
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'quotation',
        title: `Quotation ${customId} submitted`,
        detail: `Vendor '${vendor.name}' bid $${amount} on RFQ #${rfqId}.`,
        organizationId: orgId,
      },
    });

    // Notify Procurement Officers and Managers
    const usersToNotify = await prisma.user.findMany({
      where: {
        organizationId: orgId,
        role: { in: ['Procurement Officer', 'Manager / Approver'] }
      }
    });
    for (const u of usersToNotify) {
      await prisma.notification.create({
        data: {
          userId: u.id,
          message: `New quotation proposal ${customId} ($${amount}) submitted by ${vendor.name} for RFQ #${rfqId}.`
        }
      });
    }

    res.status(201).json(quotation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a quotation (Vendor only)
router.patch('/:id', authenticate, authorize(['Vendor']), async (req: AuthRequest, res: Response) => {
  try {
    const { amount, deliveryTimeDays, notes } = req.body;
    const quotation = await prisma.quotation.findUnique({ where: { id: req.params.id } });
    if (!quotation) {
      res.status(404).json({ error: 'Quotation not found' });
      return;
    }
    if (quotation.vendorId !== req.user!.vendorId) {
      res.status(403).json({ error: 'Forbidden. You do not own this quotation.' });
      return;
    }

    const updatedQuote = await prisma.quotation.update({
      where: { id: req.params.id },
      data: {
        amount: amount ? Number(amount) : undefined,
        deliveryTimeDays: deliveryTimeDays ? Number(deliveryTimeDays) : undefined,
        notes,
      },
    });

    await prisma.activityLog.create({
      data: {
        type: 'quotation',
        title: `Quotation ${quotation.id} updated`,
        detail: `Vendor updated pricing to $${amount || quotation.amount}.`,
        organizationId: req.user!.organizationId!,
      },
    });

    res.json(updatedQuote);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/Reject Quotation (Admin, Manager / Approver)
router.patch('/:id/status', authenticate, authorize(['Admin', 'Manager / Approver']), async (req: AuthRequest, res: Response) => {
  try {
    const { status, approvalRemarks } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Can only approve or reject.' });
      return;
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { rfq: true },
    });

    if (!quotation) {
      res.status(404).json({ error: 'Quotation not found.' });
      return;
    }

    const updatedQuote = await prisma.quotation.update({
      where: { id: req.params.id },
      data: { status, approvalRemarks },
    });

    const orgId = req.user!.organizationId!;

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'quotation',
        title: `Quotation ${quotation.id} ${status.toLowerCase()}`,
        detail: `Bid by '${quotation.vendorName}' was ${status.toLowerCase()} by ${req.user!.fullName}. Remarks: ${approvalRemarks || 'None'}.`,
        organizationId: orgId,
      },
    });

    // Notify vendor contact
    const vendorUser = await prisma.user.findFirst({
      where: { vendorId: quotation.vendorId }
    });
    if (vendorUser) {
      await prisma.notification.create({
        data: {
          userId: vendorUser.id,
          message: `Your Quotation proposal ${quotation.id} has been ${status.toLowerCase()} by the procurement manager.`
        }
      });
    }

    // If approved, automatically convert to a Purchase Order!
    if (status === 'Approved') {
      const customPoId = `#PO-${Math.floor(1005 + Math.random() * 1000)}`;
      const subtotal = quotation.amount;
      const taxAmount = subtotal * 0.18; // 18% GST (Odoo Hackathon requirement)
      const total = subtotal + taxAmount;

      await prisma.purchaseOrder.create({
        data: {
          id: customPoId,
          rfqId: quotation.rfqId,
          vendorId: quotation.vendorId,
          vendorName: quotation.vendorName,
          product: quotation.rfq.title,
          qty: quotation.rfq.itemsCount,
          unitPrice: Number((subtotal / quotation.rfq.itemsCount).toFixed(2)),
          subtotal,
          taxAmount,
          total,
          status: 'Pending Approval',
          organizationId: orgId,
        },
      });

      // Update RFQ status to 'Closed' since it has been finalized
      await prisma.rFQ.update({
        where: { id: quotation.rfqId },
        data: { status: 'Closed' }
      });

      // Log purchase order creation
      await prisma.activityLog.create({
        data: {
          type: 'po',
          title: `Purchase Order ${customPoId} generated`,
          detail: `PO generated from approved bid ${quotation.id}. Subtotal: $${subtotal}, GST(18%): $${taxAmount}, Total: $${total}`,
          organizationId: orgId,
        },
      });
    }

    res.json(updatedQuote);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

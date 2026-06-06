import { Router, Response } from 'express';
import prisma from '../../db.js';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.js';

const router = Router();

// Get all purchase orders
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    if (req.user!.role === 'Vendor') {
      const pos = await prisma.purchaseOrder.findMany({
        where: {
          organizationId: orgId || undefined,
          vendorId: req.user!.vendorId || '',
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(pos);
    } else {
      const pos = await prisma.purchaseOrder.findMany({
        where: { organizationId: orgId || undefined },
        orderBy: { createdAt: 'desc' },
      });
      res.json(pos);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a purchase order
router.post('/', authenticate, authorize(['Admin', 'Procurement Officer']), async (req: AuthRequest, res: Response) => {
  try {
    const { rfqId, vendorId, vendorName, product, qty, unitPrice, status } = req.body;
    if (!vendorName || !product || !qty || !unitPrice) {
      res.status(400).json({ error: 'Vendor, product details, quantity, and unit rate are required.' });
      return;
    }

    const customId = `#PO-${Math.floor(1005 + Math.random() * 1000)}`;
    const orgId = req.user!.organizationId!;

    const subtotal = Number(qty) * Number(unitPrice);
    const taxAmount = subtotal * 0.18; // 18% GST (Odoo Hackathon requirement)
    const total = subtotal + taxAmount;

    // Use default values if no RFQ/Vendor reference provided
    const resolvedRfqId = rfqId || 'Manual-PO';
    const resolvedVendorId = vendorId || 'VND-Manual';

    const po = await prisma.purchaseOrder.create({
      data: {
        id: customId,
        rfqId: resolvedRfqId,
        vendorId: resolvedVendorId,
        vendorName,
        product,
        qty: Number(qty),
        unitPrice: Number(unitPrice),
        subtotal,
        taxAmount,
        total,
        status: status || 'Pending Approval',
        organizationId: orgId,
      },
    });

    // Add activity log
    await prisma.activityLog.create({
      data: {
        type: 'po',
        title: `Purchase Order ${po.id} generated manually`,
        detail: `Item: ${product}, Quantity: ${qty}. Subtotal: $${subtotal}, GST(18%): $${taxAmount}, Total: $${total}`,
        organizationId: orgId,
      },
    });

    res.status(201).json(po);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Purchase Order status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const po = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Add activity log
    await prisma.activityLog.create({
      data: {
        type: 'po',
        title: `PO ${po.id} marked as ${status}`,
        detail: `Status update recorded by ${req.user!.fullName}.`,
        organizationId: req.user!.organizationId!,
      },
    });

    res.json(po);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import { Router, Response } from 'express';
import prisma from '../../db.js';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.js';

const router = Router();

// Get all RFQs
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const rfqs = await prisma.rFQ.findMany({
      where: orgId ? { organizationId: orgId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json(rfqs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create RFQ
router.post('/', authenticate, authorize(['Admin', 'Procurement Officer']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, vendorCategory, itemsCount, description, deadline, assignedVendors, attachmentUrl } = req.body;
    if (!title || !vendorCategory || !itemsCount) {
      res.status(400).json({ error: 'Title, category, and items count are required.' });
      return;
    }

    // Find last RFQ in DB to generate a sequential ID
    const lastRfq = await prisma.rFQ.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    let nextNum = 106;
    if (lastRfq) {
      const match = lastRfq.id.match(/\d+/);
      if (match) {
        nextNum = parseInt(match[0]) + 1;
      }
    }
    const newId = `RFQ-${nextNum}`;

    const orgId = req.user!.organizationId!;

    const rfq = await prisma.rFQ.create({
      data: {
        id: newId,
        title,
        vendorCategory,
        itemsCount: Number(itemsCount),
        description,
        deadline,
        assignedVendors: assignedVendors || '',
        attachmentUrl,
        status: 'Sent',
        organizationId: orgId,
      },
    });

    // Add activity log
    await prisma.activityLog.create({
      data: {
        type: 'rfq',
        title: `RFQ #${rfq.id} created`,
        detail: `New RFQ: '${title}' under category '${vendorCategory}' with ${itemsCount} items.`,
        organizationId: orgId,
      },
    });

    // Notify assigned vendors
    if (assignedVendors) {
      const vendorNames = assignedVendors.split(',').map((name: string) => name.trim());
      for (const name of vendorNames) {
        const vendorRecord = await prisma.vendor.findFirst({
          where: { name: name }
        });
        if (vendorRecord) {
          const vendorUser = await prisma.user.findFirst({
            where: { vendorId: vendorRecord.id }
          });
          if (vendorUser) {
            await prisma.notification.create({
              data: {
                userId: vendorUser.id,
                message: `You have been invited to submit a quotation for RFQ #${rfq.id}: ${rfq.title}.`
              }
            });
          }
        }
      }
    }

    res.status(201).json(rfq);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update RFQ status
router.patch('/:id', authenticate, authorize(['Admin', 'Procurement Officer']), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const rfq = await prisma.rFQ.update({
      where: { id: req.params.id },
      data: { status },
    });

    await prisma.activityLog.create({
      data: {
        type: 'rfq',
        title: `RFQ #${rfq.id} status updated`,
        detail: `Status changed to '${status}'.`,
        organizationId: req.user!.organizationId!,
      },
    });

    res.json(rfq);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

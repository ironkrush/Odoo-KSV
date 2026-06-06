import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../db.js';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.js';

const router = Router();

// Get all vendors
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const vendors = await prisma.vendor.findMany({
      where: orgId ? { organizationId: orgId } : undefined,
    });
    res.json(vendors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create a vendor
router.post('/', authenticate, authorize(['Admin', 'Procurement Officer']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, contactEmail, gstNumber, contactPhone, status, rating } = req.body;
    if (!name || !category || !contactEmail) {
      res.status(400).json({ error: 'Name, category, and contact email are required.' });
      return;
    }

    const customId = `VND-${Math.floor(306 + Math.random() * 600)}`;
    const orgId = req.user!.organizationId!;

    const vendor = await prisma.vendor.create({
      data: {
        id: customId,
        name,
        category,
        contactEmail,
        gstNumber,
        contactPhone,
        status: status || 'Onboarding',
        rating: rating || 0.0,
        organizationId: orgId,
      },
    });

    // Auto-create User login for the Vendor
    const userExist = await prisma.user.findUnique({ where: { email: contactEmail } });
    if (!userExist) {
      const salt = await bcrypt.genSalt(10);
      const defaultPassword = await bcrypt.hash('vendor123', salt);
      await prisma.user.create({
        data: {
          fullName: `${name} Contact`,
          email: contactEmail,
          password: defaultPassword,
          role: 'Vendor',
          organizationId: orgId,
          vendorId: vendor.id,
        },
      });
    }

    // Add activity log
    await prisma.activityLog.create({
      data: {
        type: 'vendor',
        title: `Vendor '${name}' registered`,
        detail: `New vendor account established. GST: ${gstNumber || 'N/A'}. Contact details auto-created.`,
        organizationId: orgId,
      },
    });

    res.status(201).json(vendor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update a vendor
router.patch('/:id', authenticate, authorize(['Admin', 'Procurement Officer']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, contactEmail, gstNumber, contactPhone, status, rating } = req.body;
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { name, category, contactEmail, gstNumber, contactPhone, status, rating },
    });

    // Add activity log
    await prisma.activityLog.create({
      data: {
        type: 'vendor',
        title: `Vendor '${vendor.name}' updated`,
        detail: `Vendor record updated in dashboard registries.`,
        organizationId: req.user!.organizationId!,
      },
    });

    res.json(vendor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a vendor
router.delete('/:id', authenticate, authorize(['Admin', 'Procurement Officer']), async (req: AuthRequest, res: Response) => {
  try {
    const vendor = await prisma.vendor.delete({
      where: { id: req.params.id },
    });

    // Add activity log
    await prisma.activityLog.create({
      data: {
        type: 'vendor',
        title: `Vendor '${vendor.name}' deleted`,
        detail: `Vendor record removed from registered registries database.`,
        organizationId: req.user!.organizationId!,
      },
    });

    res.json({ message: 'Vendor successfully deleted.', vendor });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

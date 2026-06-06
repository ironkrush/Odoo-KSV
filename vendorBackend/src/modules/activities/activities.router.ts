import { Router, Response } from 'express';
import prisma from '../../db.js';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.js';

const router = Router();

// Get all activity logs
router.get('/', authenticate, authorize(['Admin', 'Procurement Officer', 'Manager / Approver']), async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const logs = await prisma.activityLog.findMany({
      where: orgId ? { organizationId: orgId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

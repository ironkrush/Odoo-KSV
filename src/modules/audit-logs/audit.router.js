import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';
import {
  handleGetAuditLogs,
  handleGetDashboardAnalytics,
} from './audit.controller.js';

const router = Router();

// Secure all audit/analytics endpoints
router.use(authMiddleware);
router.use(roleMiddleware(['PROCUREMENT_OFFICER', 'APPROVER_L2']));

router.get('/logs', handleGetAuditLogs);
router.get('/dashboard-analytics', handleGetDashboardAnalytics);

export default router;

import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';
import {
  handleGetPendingWorkflows,
  handleApprovalAction,
} from './approvals.controller.js';

const router = Router();

// Secure all approval endpoints to Approver roles only
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN', 'PROCUREMENT_HEAD', 'FINANCE_MANAGER']));

router.get('/pending', handleGetPendingWorkflows);
router.post('/action', handleApprovalAction);

export default router;

import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';
import {
  handleGetRfqs,
  handleGetRfqById,
  handleCreateRfq,
} from './rfqs.controller.js';

const router = Router();

// Secure all RFQ routes
router.use(authMiddleware);

router.get('/', handleGetRfqs);
router.get('/:id', handleGetRfqById);
router.post('/', roleMiddleware(['PROCUREMENT_OFFICER']), handleCreateRfq);

export default router;

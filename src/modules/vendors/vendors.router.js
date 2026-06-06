import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';
import {
  handleGetVendors,
  handleGetVendorById,
  handleCreateVendor,
  handleUpdateVendor,
} from './vendors.controller.js';

const router = Router();

// Secure all vendor endpoints
router.use(authMiddleware);

router.get('/', roleMiddleware(['PROCUREMENT_OFFICER', 'APPROVER_L1', 'APPROVER_L2']), handleGetVendors);
router.get('/:id', handleGetVendorById);
router.post('/', roleMiddleware(['PROCUREMENT_OFFICER']), handleCreateVendor);
router.put('/:id', roleMiddleware(['PROCUREMENT_OFFICER']), handleUpdateVendor);

export default router;

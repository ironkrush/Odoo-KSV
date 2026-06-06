import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';
import {
  handleGetInvoices,
  handleGetInvoiceById,
  handleCreateInvoice,
  handleUpdateInvoiceStatus,
} from './invoices.controller.js';

const router = Router();

// Secure all invoice routes
router.use(authMiddleware);

router.get('/', handleGetInvoices);
router.get('/:id', handleGetInvoiceById);
router.post('/', handleCreateInvoice);
router.patch('/:id/status', roleMiddleware(['PROCUREMENT_OFFICER']), handleUpdateInvoiceStatus);

export default router;

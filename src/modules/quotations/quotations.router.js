import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';
import {
  handleGetQuotations,
  handleGetQuotationById,
  handleSubmitQuotation,
  handleGetQuotationsComparison,
  handleSelectQuotation,
} from './quotations.controller.js';

const router = Router();

// Secure all quotation endpoints
router.use(authMiddleware);

router.get('/', handleGetQuotations);
router.get('/compare', roleMiddleware(['PROCUREMENT_OFFICER', 'PROCUREMENT_HEAD', 'FINANCE_MANAGER', 'ADMIN']), handleGetQuotationsComparison);
router.get('/:id', handleGetQuotationById);
router.post('/', handleSubmitQuotation);
router.post('/:id/select', roleMiddleware(['PROCUREMENT_OFFICER', 'ADMIN']), handleSelectQuotation);

export default router;

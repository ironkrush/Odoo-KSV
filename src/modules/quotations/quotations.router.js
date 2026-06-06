import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import {
  handleGetQuotations,
  handleGetQuotationById,
  handleSubmitQuotation,
} from './quotations.controller.js';

const router = Router();

// Secure all quotation endpoints
router.use(authMiddleware);

router.get('/', handleGetQuotations);
router.get('/:id', handleGetQuotationById);
router.post('/', handleSubmitQuotation);

export default router;

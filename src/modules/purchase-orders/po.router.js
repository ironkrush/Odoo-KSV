import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { handleGetPos, handleGetPoById } from './po.controller.js';

const router = Router();

// Secure all PO routes
router.use(authMiddleware);

router.get('/', handleGetPos);
router.get('/:id', handleGetPoById);

export default router;

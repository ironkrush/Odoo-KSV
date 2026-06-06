import express from 'express';
import cors from 'cors';
import authRouter from './modules/auth/auth.router.js';
import vendorsRouter from './modules/vendors/vendors.router.js';
import rfqsRouter from './modules/rfqs/rfqs.router.js';
import quotationsRouter from './modules/quotations/quotations.router.js';
import approvalsRouter from './modules/approvals/approvals.router.js';
import poRouter from './modules/purchase-orders/po.router.js';
import invoicesRouter from './modules/invoices/invoices.router.js';
import auditRouter from './modules/audit-logs/audit.router.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Base status check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Mount Module Routers
app.use('/api/auth', authRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/rfqs', rfqsRouter);
app.use('/api/quotations', quotationsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/pos', poRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/audit', auditRouter);

// Global Error Handler
app.use(errorMiddleware);

export default app;

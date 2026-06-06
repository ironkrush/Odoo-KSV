import express, { Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import prisma from './db.js';
import { authenticate, AuthRequest } from './middleware/auth.js';

import authRouter from './modules/auth/auth.router.js';
import vendorsRouter from './modules/vendors/vendors.router.js';
import rfqsRouter from './modules/rfqs/rfqs.router.js';
import quotationsRouter from './modules/quotations/quotations.router.js';
import purchaseordersRouter from './modules/purchaseorders/purchaseorders.router.js';
import invoicesRouter from './modules/invoices/invoices.router.js';
import activitiesRouter from './modules/activities/activities.router.js';
import analyticsRouter from './modules/analytics/analytics.router.js';
import notificationsRouter from './modules/notifications/notifications.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Upload directory static mapping
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Mount vertical slices
app.use('/api/auth', authRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/rfqs', rfqsRouter);
app.use('/api/quotations', quotationsRouter);
app.use('/api/purchase-orders', purchaseordersRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/activity-logs', activitiesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationsRouter);

// File Upload endpoint
app.post('/api/upload', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) {
      res.status(400).json({ error: 'fileName and fileData (Base64) are required.' });
      return;
    }

    const base64Data = fileData.replace(/^data:.*;base64,/, "");
    
    const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const filePath = path.join(uploadDir, safeFileName);
    fs.writeFileSync(filePath, base64Data, 'base64');

    res.json({ url: `/uploads/${safeFileName}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Seed endpoint
app.post('/api/setup/seed', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    exec('npm run prisma:seed', (err, stdout, stderr) => {
      if (err) {
        console.error('Seed execution failed:', err);
        res.status(500).json({ error: 'Database seeding failed.', details: stderr });
        return;
      }
      res.json({ message: 'Seeding completed successfully.', output: stdout });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend static assets from vendorFrontend/dist
const frontendDist = path.join(__dirname, '..', '..', 'vendorFrontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

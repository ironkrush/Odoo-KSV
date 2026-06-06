import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../db.js';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-vendorbridge-key-2026-draft';

// Register a new Organization and Admin account
router.post('/register', async (req, res) => {
  try {
    const { companyName, fullName, email, password } = req.body;
    if (!companyName || !fullName || !email || !password) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered.' });
      return;
    }

    // Create Organization
    const organization = await prisma.organization.create({
      data: { name: companyName },
    });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User (Role default Admin)
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: 'Admin',
        organizationId: organization.id,
      },
    });

    // Generate JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        vendorId: user.vendorId,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        vendorId: user.vendorId,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Invite team member
router.post('/invite', authenticate, authorize(['Admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    if (!['Procurement Officer', 'Manager / Approver', 'Admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role selection.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
        organizationId: req.user!.organizationId,
      },
    });

    res.status(201).json({
      message: `User '${fullName}' successfully invited as '${role}'.`,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users in the organization
router.get('/users', authenticate, authorize(['Admin']), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { organizationId: req.user!.organizationId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

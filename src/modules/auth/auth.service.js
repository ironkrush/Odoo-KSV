import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-vendorbridge-key-2026-draft';

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { vendor: true },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      vendorId: user.vendorId,
      vendor: user.vendor,
    },
    token,
  };
};

export const register = async ({ email, name, password, role, vendorId }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  if (role === 'VENDOR' && !vendorId) {
    throw new Error('Vendor users must be linked to a vendor profile');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role,
      vendorId: vendorId || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      vendorId: true,
    },
  });

  return newUser;
};

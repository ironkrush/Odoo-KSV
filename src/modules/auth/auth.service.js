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
      phone: user.phone,
      department: user.department,
      designation: user.designation,
      approvalLimit: user.approvalLimit,
      vendorId: user.vendorId,
      vendor: user.vendor,
    },
    token,
  };
};

export const register = async (payload) => {
  const {
    email,
    name,
    password,
    role,
    phone,
    department,
    designation,
    approvalLimit,
    vendorId,
    newVendorDetails,
  } = payload;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.$transaction(async (tx) => {
    let finalVendorId = vendorId || null;

    if (role === 'VENDOR') {
      if (newVendorDetails) {
        // Double check GST or Email uniqueness
        const existingVendor = await tx.vendor.findFirst({
          where: {
            OR: [
              { gstNo: newVendorDetails.gstNo },
              { email: newVendorDetails.email },
            ],
          },
        });

        if (existingVendor) {
          throw new Error('A vendor with this GST number or email already exists');
        }

        // Create new vendor profile
        const vendor = await tx.vendor.create({
          data: {
            name: newVendorDetails.name,
            category: newVendorDetails.category,
            gstNo: newVendorDetails.gstNo,
            contactNo: newVendorDetails.contactNo,
            status: 'PENDING',
            email: newVendorDetails.email,
            address: newVendorDetails.address || null,
            city: newVendorDetails.city || null,
            state: newVendorDetails.state || null,
            pincode: newVendorDetails.pincode || null,
            panNo: newVendorDetails.panNo || null,
            bankName: newVendorDetails.bankName || null,
            bankAccNo: newVendorDetails.bankAccNo || null,
            ifscCode: newVendorDetails.ifscCode || null,
            website: newVendorDetails.website || null,
            paymentTerms: newVendorDetails.paymentTerms || 'Net 30',
          },
        });
        finalVendorId = vendor.id;
      } else if (!finalVendorId) {
        throw new Error('Vendor users must link to an existing vendorId or provide newVendorDetails');
      } else {
        // Validate existing vendorId exists
        const vendor = await tx.vendor.findUnique({ where: { id: finalVendorId } });
        if (!vendor) {
          throw new Error('Linked vendor profile not found');
        }
      }
    }

    const newUser = await tx.user.create({
      data: {
        email,
        name,
        passwordHash,
        role,
        phone: phone || null,
        department: department || null,
        designation: designation || null,
        approvalLimit: approvalLimit || 0.0,
        vendorId: finalVendorId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        department: true,
        designation: true,
        approvalLimit: true,
        vendorId: true,
      },
    });

    // Write audit log
    await tx.auditLog.create({
      data: {
        action: 'USER_REGISTERED',
        userId: newUser.id,
        details: JSON.stringify({ role: newUser.role, vendorId: finalVendorId }),
      },
    });

    return newUser;
  });
};

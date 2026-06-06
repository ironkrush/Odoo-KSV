import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const newVendorDetailsSchema = z.object({
  name: z.string().min(2, 'Vendor company name must be at least 2 characters'),
  category: z.string().nonempty('Category is required'),
  gstNo: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format (standard 15-character GSTIN format required)'),
  contactNo: z.string().min(8, 'Contact number must be at least 8 digits'),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  panNo: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccNo: z.string().optional().nullable(),
  ifscCode: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  paymentTerms: z.string().optional().default('Net 30'),
  email: z.string().email('Invalid email address'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['PROCUREMENT_OFFICER', 'APPROVER_L1', 'APPROVER_L2', 'VENDOR']),
  
  // Extra User metadata fields
  phone: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  approvalLimit: z.number().nonnegative('Approval limit must be positive').optional().default(0.0),

  // Vendor linkage options
  vendorId: z.number().optional().nullable(),
  newVendorDetails: newVendorDetailsSchema.optional().nullable(),
});

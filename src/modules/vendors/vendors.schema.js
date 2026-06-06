import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().nonempty('Category is required'),
  gstNo: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format (standard 15-character GSTIN format required)'),
  contactNo: z.string().min(8, 'Contact number must be at least 8 digits'),
  status: z.enum(['ACTIVE', 'PENDING', 'BLOCKED']).default('PENDING'),
  email: z.string().email('Invalid email address'),
  
  // Extra columns
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
  rating: z.number().min(1.0).max(5.0).optional().default(5.0),
});

export const updateVendorSchema = createVendorSchema.partial();

import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().nonempty('Category is required'),
  gstNo: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format (standard 15-character GSTIN format required)'),
  contactNo: z.string().min(8, 'Contact number must be at least 8 digits'),
  status: z.enum(['ACTIVE', 'PENDING', 'BLOCKED']).default('PENDING'),
  email: z.string().email('Invalid email address'),
});

export const updateVendorSchema = createVendorSchema.partial();

import { z } from 'zod';

export const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(3, 'Invoice number must be at least 3 characters'),
  poId: z.number().int().positive('Invalid PO ID'),
  invoiceDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).transform((val) => new Date(val)),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).transform((val) => new Date(val)),
  totalAmount: z.number().positive('Total amount must be positive'),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['PENDING_PAYMENT', 'PAID', 'OVERDUE']),
});

import { z } from 'zod';

export const submitQuotationSchema = z.object({
  rfqId: z.number().int().positive('Invalid RFQ ID'),
  deliveryDays: z.number().int().positive('Delivery days must be a positive integer'),
  taxRate: z.number().nonnegative('Tax rate must be non-negative'),
  terms: z.string().optional(),
  items: z.array(
    z.object({
      rfqItemId: z.number().int().positive('Invalid RFQ item ID'),
      unitPrice: z.number().positive('Unit price must be a positive number'),
    })
  ).min(1, 'At least one line item quotation is required'),
});

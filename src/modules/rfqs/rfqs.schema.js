import { z } from 'zod';

export const createRfqSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  category: z.string().nonempty('Category is required'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).transform((val) => new Date(val)),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  invitedVendorIds: z.array(z.number()).min(1, 'Invite at least one vendor'),
  items: z.array(
    z.object({
      itemName: z.string().min(1, 'Item name is required'),
      quantity: z.number().int().positive('Quantity must be a positive integer'),
      unit: z.string().min(1, 'Unit description is required (e.g., pcs, box, kg)'),
    })
  ).min(1, 'Add at least one line item'),
});

export const updateRfqSchema = createRfqSchema.partial();

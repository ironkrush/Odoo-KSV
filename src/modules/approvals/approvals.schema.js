import { z } from 'zod';

export const approvalActionSchema = z.object({
  workflowId: z.number().int().positive('Invalid workflow ID'),
  action: z.enum(['APPROVE', 'REJECT']),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional(),
});

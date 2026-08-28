import { z } from 'zod';

export const createGradeSchema = z.object({
  number: z.number().int().min(1).max(13),
  name: z.string().min(1, 'Name is required'),
  isActive: z.boolean().optional(),
});

export const updateGradeSchema = z.object({
  number: z.number().int().min(1).max(13).optional(),
  name: z.string().min(1, 'Name is required').optional(),
  isActive: z.boolean().optional(),
});

import { z } from 'zod';
export const updateConfigSchema = z.object({
  value: z.string().min(1),
  description: z.string().optional(),
});
export const createConfigSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional(),
});

import { z } from 'zod';

export const createParentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  childrenIds: z.array(z.string()).optional(),
});

export const updateParentSchema = createParentSchema.partial();

export const linkChildSchema = z.object({
  studentId: z.string().min(1),
  relationship: z.string().optional(),
});

import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'STUDENT', 'TEACHER', 'PARENT']).optional(),
});

export const updateUserSchema = createUserSchema.partial();

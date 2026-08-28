import { z } from 'zod';

export const createStudentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  admissionNumber: z.string().min(1),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

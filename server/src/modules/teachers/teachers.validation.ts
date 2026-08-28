import { z } from 'zod';

export const createTeacherSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  employeeId: z.string().min(1),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  phone: z.string().optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial();

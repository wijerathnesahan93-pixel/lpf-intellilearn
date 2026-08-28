import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1),
  academicYearId: z.string().min(1),
  grade: z.string().min(1),
  section: z.string().optional().default('A'),
  capacity: z.number().int().positive().optional(),
});

export const updateClassSchema = createClassSchema.partial();

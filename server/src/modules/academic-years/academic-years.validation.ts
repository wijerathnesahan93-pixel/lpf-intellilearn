import { z } from 'zod';

export const createAcademicYearSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isCurrent: z.boolean().optional(),
});

export const updateAcademicYearSchema = createAcademicYearSchema.partial();

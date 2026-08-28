import { z } from 'zod';
export const createSubjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  courseId: z.string().uuid(),
  description: z.string().optional(),
});
export const updateSubjectSchema = createSubjectSchema.partial();

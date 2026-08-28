import { z } from 'zod';
export const createLessonSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  subjectId: z.string().uuid(),
  topicId: z.string().uuid().optional(),
  orderIndex: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});
export const updateLessonSchema = createLessonSchema.partial();

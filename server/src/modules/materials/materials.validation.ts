import { z } from 'zod';
export const createMaterialSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['PDF', 'DOCUMENT', 'PRESENTATION', 'VIDEO', 'IMAGE', 'REFERENCE']),
  subjectId: z.string().uuid(),
  topicId: z.string().uuid().optional(),
  isPublished: z.boolean().optional(),
});
export const updateMaterialSchema = createMaterialSchema.partial();

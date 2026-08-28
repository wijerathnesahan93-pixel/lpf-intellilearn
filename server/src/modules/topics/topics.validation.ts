import { z } from 'zod';
export const createTopicSchema = z.object({
  name: z.string().min(1),
  subjectId: z.string().uuid(),
  orderIndex: z.number().int().optional(),
  description: z.string().optional(),
});
export const updateTopicSchema = createTopicSchema.partial();

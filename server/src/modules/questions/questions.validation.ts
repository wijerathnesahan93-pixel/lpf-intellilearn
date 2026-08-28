import { z } from 'zod';

export const createQuestionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  marks: z.number().int().positive(),
  subjectId: z.string().uuid(),
  topicId: z.string().uuid().optional(),
  explanation: z.string().optional(),
  correctAnswer: z.string().min(1),
  options: z.array(z.object({
    label: z.string(),
    text: z.string(),
    isCorrect: z.boolean()
  })).min(2)
});

export const updateQuestionSchema = createQuestionSchema.partial();

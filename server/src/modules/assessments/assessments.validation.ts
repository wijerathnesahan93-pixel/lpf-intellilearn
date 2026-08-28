import { z } from 'zod';

export const createAssessmentSchema = z.object({
  title: z.string().min(3),
  instructions: z.string().optional(),
  type: z.enum(['QUIZ', 'PRACTICE_TEST', 'MODEL_PAPER', 'PAST_PAPER', 'MOCK_EXAM']),
  subjectId: z.string().uuid(),
  classId: z.string().uuid().optional(),
  duration: z.number().int().positive(),
  maxAttempts: z.number().int().positive().optional(),
  availableFrom: z.string().datetime().optional(),
  availableTo: z.string().datetime().optional(),
  isPublished: z.boolean().optional().default(false),
  questionIds: z.array(z.object({
    questionId: z.string().uuid(),
    orderIndex: z.number().int().nonnegative(),
    marks: z.number().int().positive()
  })).min(1)
});

export const updateAssessmentSchema = createAssessmentSchema.partial();

export const submitAttemptSchema = z.object({
  answers: z.array(z.object({
    assessmentQuestionId: z.string().uuid(),
    selectedAnswer: z.string().min(1)
  }))
});

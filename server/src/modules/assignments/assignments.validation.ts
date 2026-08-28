import { z } from 'zod';

export const createAssignmentSchema = z.object({
  title: z.string().min(3),
  instructions: z.string().optional(),
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
  totalMarks: z.number().int().positive(),
  dueDate: z.string().datetime(),
  isPublished: z.boolean().optional().default(false),
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

export const submitAssignmentSchema = z.object({
  content: z.string().min(1),
});

export const reviewSubmissionSchema = z.object({
  marks: z.number().min(0),
  feedback: z.string().optional(),
  status: z.enum(['REVIEWED', 'RETURNED']),
});

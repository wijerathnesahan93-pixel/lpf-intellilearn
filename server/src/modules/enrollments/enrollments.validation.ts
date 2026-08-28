import { z } from 'zod';
export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
});
export const bulkEnrollSchema = z.object({
  studentIds: z.array(z.string().uuid()),
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
});

import { z } from 'zod';
export const createTeacherAssignmentSchema = z.object({
  teacherId: z.string().uuid(),
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
});

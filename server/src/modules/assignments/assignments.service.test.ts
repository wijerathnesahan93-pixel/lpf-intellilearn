import { vi, describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../config/database';
import { assignmentService } from './assignments.service';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

vi.mock('../../config/database', () => ({
  default: {
    student: {
      findUnique: vi.fn(),
    },
    teacher: {
      findUnique: vi.fn(),
    },
    assignment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    assignmentSubmission: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    enrollment: {
      findMany: vi.fn()
    },
    teacherSubjectAssignment: {
      findFirst: vi.fn()
    }
  }
}));

describe('AssignmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should list assignments for a teacher', async () => {
      const mockTeacher = { id: 'teacher-1' };
      const mockAssignments = [{ id: 'ass-1', title: 'Math Homework' }];
      
      vi.mocked(prisma.teacher.findUnique).mockResolvedValue(mockTeacher as any);
      vi.mocked(prisma.assignment.count).mockResolvedValue(1);
      vi.mocked(prisma.assignment.findMany).mockResolvedValue(mockAssignments as any);

      const result = await assignmentService.list({
        page: 1,
        limit: 10,
        teacherId: 'user-teacher-id',
        role: 'TEACHER'
      });

      expect(result.data).toEqual(mockAssignments);
      expect(prisma.teacher.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-teacher-id' } });
      expect(prisma.assignment.findMany).toHaveBeenCalled();
    });

    it('should throw ForbiddenError if teacher profile is not found', async () => {
      vi.mocked(prisma.teacher.findUnique).mockResolvedValue(null);

      await expect(
        assignmentService.list({
          page: 1,
          limit: 10,
          teacherId: 'user-teacher-id',
          role: 'TEACHER'
        })
      ).rejects.toThrow('Teacher profile not found');
    });
  });

  describe('create', () => {
    it('should create an assignment if teacher is assigned to the class and subject', async () => {
      const mockTeacher = { id: 'teacher-1' };
      const mockAssignmentData = {
        title: 'New Algebra Task',
        subjectId: 'sub-1',
        classId: 'class-1',
        totalMarks: 100,
        dueDate: new Date().toISOString()
      };

      vi.mocked(prisma.teacher.findUnique).mockResolvedValue(mockTeacher as any);
      vi.mocked(prisma.teacherSubjectAssignment.findFirst).mockResolvedValue({ id: 'ts-1' } as any);
      vi.mocked(prisma.assignment.create).mockResolvedValue({ id: 'ass-1', ...mockAssignmentData } as any);

      const result = await assignmentService.create(mockAssignmentData, 'user-teacher-id');

      expect(result.id).toBe('ass-1');
      expect(prisma.teacherSubjectAssignment.findFirst).toHaveBeenCalledWith({
        where: { teacherId: 'teacher-1', subjectId: 'sub-1', classId: 'class-1' }
      });
      expect(prisma.assignment.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenError if teacher is not assigned to the class and subject', async () => {
      const mockTeacher = { id: 'teacher-1' };
      const mockAssignmentData = {
        title: 'New Algebra Task',
        subjectId: 'sub-1',
        classId: 'class-2',
        totalMarks: 100,
        dueDate: new Date().toISOString()
      };

      vi.mocked(prisma.teacher.findUnique).mockResolvedValue(mockTeacher as any);
      vi.mocked(prisma.teacherSubjectAssignment.findFirst).mockResolvedValue(null);

      await expect(
        assignmentService.create(mockAssignmentData, 'user-teacher-id')
      ).rejects.toThrow('Teacher is not assigned to this subject and class');
    });
  });

  describe('delete', () => {
    it('should delete the assignment if user is the creator teacher', async () => {
      const mockAssignment = { id: 'ass-1', teacherId: 'teacher-1' };
      const mockTeacher = { id: 'teacher-1' };

      vi.mocked(prisma.assignment.findUnique).mockResolvedValue(mockAssignment as any);
      vi.mocked(prisma.teacher.findUnique).mockResolvedValue(mockTeacher as any);
      vi.mocked(prisma.assignment.delete).mockResolvedValue(mockAssignment as any);

      await assignmentService.delete('ass-1', 'user-teacher-id', 'TEACHER');

      expect(prisma.assignment.delete).toHaveBeenCalledWith({ where: { id: 'ass-1' } });
    });

    it('should throw ForbiddenError if a different teacher attempts to delete', async () => {
      const mockAssignment = { id: 'ass-1', teacherId: 'teacher-1' };
      const mockTeacher = { id: 'teacher-different' };

      vi.mocked(prisma.assignment.findUnique).mockResolvedValue(mockAssignment as any);
      vi.mocked(prisma.teacher.findUnique).mockResolvedValue(mockTeacher as any);

      await expect(
        assignmentService.delete('ass-1', 'user-teacher-id', 'TEACHER')
      ).rejects.toThrow('Only the creator or admin can delete this assignment');
    });
  });
});

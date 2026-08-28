import { vi, describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../config/database';
import { studentRegistrationsService } from './student-registrations.service';
import { ConflictError, NotFoundError } from '../../utils/errors';

vi.mock('../../config/database', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    studentRegistration: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
    student: {
      count: vi.fn(),
      create: vi.fn(),
    },
    parent: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    parentChild: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    enrollment: {
      create: vi.fn(),
    },
    class: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    academicYear: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  }
}));

describe('StudentRegistrationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated registrations list', async () => {
      vi.mocked(prisma.studentRegistration.count).mockResolvedValue(1);
      vi.mocked(prisma.studentRegistration.findMany).mockResolvedValue([
        { id: 'reg-1', firstName: 'John', status: 'PENDING' }
      ] as any);

      const result = await studentRegistrationsService.list({ page: 1, limit: 10, status: 'PENDING' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('John');
      expect(prisma.studentRegistration.findMany).toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    it('should set status of registration to REJECTED', async () => {
      vi.mocked(prisma.studentRegistration.findUnique).mockResolvedValue({ id: 'reg-1', status: 'PENDING' } as any);
      vi.mocked(prisma.studentRegistration.update).mockResolvedValue({ id: 'reg-1', status: 'REJECTED' } as any);

      const result = await studentRegistrationsService.reject('reg-1');

      expect(result.status).toBe('REJECTED');
      expect(prisma.studentRegistration.update).toHaveBeenCalledWith({
        where: { id: 'reg-1' },
        data: { status: 'REJECTED' }
      });
    });

    it('should throw ConflictError if already processed', async () => {
      vi.mocked(prisma.studentRegistration.findUnique).mockResolvedValue({ id: 'reg-1', status: 'APPROVED' } as any);

      await expect(
        studentRegistrationsService.reject('reg-1')
      ).rejects.toThrow('Cannot reject a registration that is already approved');
    });
  });

  describe('approve', () => {
    it('should create student, parent, link them, enroll them, and set status to APPROVED', async () => {
      const mockReg = {
        id: 'reg-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@student.com',
        passwordHash: 'hashed-pwd',
        gradeNumber: 10,
        classSection: 'A',
        parentName: 'Jane Doe',
        parentEmail: 'jane@parent.com',
        parentPhone: '0771234567',
        relationship: 'Parent',
        status: 'PENDING',
        dateOfBirth: null,
        gender: 'MALE',
        address: 'Colombo'
      };

      const mockClass = {
        id: 'class-10a',
        name: '10-A',
        grade: 10,
        subjects: [
          { subjectId: 'math-123' },
          { subjectId: 'science-123' }
        ]
      };

      vi.mocked(prisma.studentRegistration.findUnique).mockResolvedValue(mockReg as any);
      vi.mocked(prisma.class.findUnique).mockResolvedValue(mockClass as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.student.count).mockResolvedValue(0);
      vi.mocked(prisma.user.create).mockResolvedValue({ id: 'student-user-1' } as any);
      vi.mocked(prisma.student.create).mockResolvedValue({ id: 'student-profile-1' } as any);
      vi.mocked(prisma.parent.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.parent.create).mockResolvedValue({ id: 'parent-profile-1' } as any);
      vi.mocked(prisma.parentChild.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.parentChild.create).mockResolvedValue({ id: 'pc-1' } as any);
      vi.mocked(prisma.enrollment.create).mockResolvedValue({ id: 'enroll-1' } as any);
      vi.mocked(prisma.studentRegistration.update).mockResolvedValue({ ...mockReg, status: 'APPROVED' } as any);

      const result = await studentRegistrationsService.approve('reg-1', 'class-10a');

      expect(result.studentUser).toBeDefined();
      expect(result.student).toBeDefined();
      expect(result.parent).toBeDefined();

      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.student.create).toHaveBeenCalled();
      expect(prisma.parentChild.create).toHaveBeenCalled();
      
      // 2 subject enrollments = 2 calls
      expect(prisma.enrollment.create).toHaveBeenCalledTimes(2);
      expect(prisma.studentRegistration.update).toHaveBeenCalledWith({
        where: { id: 'reg-1' },
        data: { status: 'APPROVED' }
      });
    });

    it('should automatically find the class by grade and active academic year when classId is not provided', async () => {
      const mockReg = {
        id: 'reg-2',
        firstName: 'Bob',
        lastName: 'Tables',
        email: 'bob@student.com',
        passwordHash: 'hashed-pwd',
        gradeNumber: 10,
        classSection: 'A',
        parentName: 'Jane Doe',
        parentEmail: 'jane@parent.com',
        parentPhone: '0771234567',
        relationship: 'Parent',
        status: 'PENDING',
        dateOfBirth: null,
        gender: 'MALE',
        address: 'Colombo'
      };

      const mockClass = {
        id: 'class-10a',
        name: '10-A',
        grade: 10,
        subjects: [
          { subjectId: 'math-123' },
          { subjectId: 'science-123' }
        ]
      };

      vi.mocked(prisma.studentRegistration.findUnique).mockResolvedValue(mockReg as any);
      vi.mocked(prisma.academicYear.findFirst).mockResolvedValue({ id: 'ay-2025' } as any);
      vi.mocked(prisma.class.findFirst).mockResolvedValue(mockClass as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.student.count).mockResolvedValue(0);
      vi.mocked(prisma.user.create).mockResolvedValue({ id: 'student-user-2' } as any);
      vi.mocked(prisma.student.create).mockResolvedValue({ id: 'student-profile-2' } as any);
      vi.mocked(prisma.parent.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.parent.create).mockResolvedValue({ id: 'parent-profile-2' } as any);
      vi.mocked(prisma.parentChild.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.parentChild.create).mockResolvedValue({ id: 'pc-2' } as any);
      vi.mocked(prisma.enrollment.create).mockResolvedValue({ id: 'enroll-2' } as any);
      vi.mocked(prisma.studentRegistration.update).mockResolvedValue({ ...mockReg, status: 'APPROVED' } as any);

      const result = await studentRegistrationsService.approve('reg-2');

      expect(result.studentUser).toBeDefined();
      expect(result.student).toBeDefined();
      expect(result.parent).toBeDefined();

      expect(prisma.academicYear.findFirst).toHaveBeenCalledWith({ where: { isCurrent: true } });
      expect(prisma.class.findFirst).toHaveBeenCalledWith({
        where: { grade: 10, academicYearId: 'ay-2025' },
        include: { subjects: true }
      });
      expect(prisma.enrollment.create).toHaveBeenCalledTimes(2);
    });
  });
});

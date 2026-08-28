import { vi, describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../config/database';
import { assessmentService } from './assessments.service';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

vi.mock('../../config/database', () => ({
  default: {
    student: {
      findUnique: vi.fn(),
    },
    assessmentAttempt: {
      findFirst: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    systemConfig: {
      findUnique: vi.fn().mockResolvedValue({ value: 'false' }),
    },
    studentAnswer: {
      createMany: vi.fn(),
    },
    assessmentResult: {
      create: vi.fn(),
    },
    performanceRecord: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  }
}));

describe('AssessmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitAttempt', () => {
    it('should calculate scores, update attempt and create results', async () => {
      const mockStudent = { id: 'student-1' };
      const mockAttempt = {
        id: 'attempt-1',
        assessment: {
          id: 'assess-1',
          totalMarks: 10,
          subjectId: 'sub-1',
          questions: [
            {
              id: 'aq-1',
              marks: 5,
              question: { correctAnswer: 'A' }
            },
            {
              id: 'aq-2',
              marks: 5,
              question: { correctAnswer: 'B' }
            }
          ]
        }
      };

      vi.mocked(prisma.student.findUnique).mockResolvedValue(mockStudent as any);
      vi.mocked(prisma.assessmentAttempt.findFirst).mockResolvedValue(mockAttempt as any);
      vi.mocked(prisma.assessmentAttempt.update).mockResolvedValue({ id: 'attempt-1', status: 'SUBMITTED' } as any);
      vi.mocked(prisma.assessmentResult.create).mockResolvedValue({ id: 'res-1', percentage: 100 } as any);
      vi.mocked(prisma.performanceRecord.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.performanceRecord.create).mockResolvedValue({ id: 'pr-1' } as any);

      const data = {
        answers: [
          { assessmentQuestionId: 'aq-1', selectedAnswer: 'A' }, // Correct: 5 marks
          { assessmentQuestionId: 'aq-2', selectedAnswer: 'B' }  // Correct: 5 marks
        ]
      };

      const result = await assessmentService.submitAttempt('assess-1', 'user-student-id', data);

      expect(result.attempt.status).toBe('SUBMITTED');
      expect(prisma.studentAnswer.createMany).toHaveBeenCalledWith({
        data: [
          {
            attemptId: 'attempt-1',
            assessmentQuestionId: 'aq-1',
            selectedAnswer: 'A',
            isCorrect: true,
            marksAwarded: 5,
            timeSpent: 0
          },
          {
            attemptId: 'attempt-1',
            assessmentQuestionId: 'aq-2',
            selectedAnswer: 'B',
            isCorrect: true,
            marksAwarded: 5,
            timeSpent: 0
          }
        ]
      });

      expect(prisma.assessmentResult.create).toHaveBeenCalledWith({
        data: {
          attemptId: 'attempt-1',
          studentId: 'student-1',
          assessmentId: 'assess-1',
          obtainedMarks: 10,
          totalMarks: 10,
          percentage: 100,
          correctAnswers: 2,
          incorrectAnswers: 0,
          unanswered: 0
        }
      });

      expect(prisma.performanceRecord.create).toHaveBeenCalledWith({
        data: {
          studentId: 'student-1',
          subjectId: 'sub-1',
          averagePercentage: 100,
          totalAttempts: 1,
          totalCorrect: 2,
          totalIncorrect: 0,
          level: 'STRONG'
        }
      });
    });

    it('should throw ForbiddenError if student profile is not found', async () => {
      vi.mocked(prisma.student.findUnique).mockResolvedValue(null);

      await expect(
        assessmentService.submitAttempt('assess-1', 'user-student-id', { answers: [] })
      ).rejects.toThrow('Student profile not found');
    });

    it('should throw NotFoundError if no active attempt is in progress', async () => {
      vi.mocked(prisma.student.findUnique).mockResolvedValue({ id: 'student-1' } as any);
      vi.mocked(prisma.assessmentAttempt.findFirst).mockResolvedValue(null);

      await expect(
        assessmentService.submitAttempt('assess-1', 'user-student-id', { answers: [] })
      ).rejects.toThrow('No active attempt found');
    });
  });
});

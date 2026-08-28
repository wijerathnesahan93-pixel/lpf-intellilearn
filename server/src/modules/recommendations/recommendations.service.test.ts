import { vi, describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../config/database';
import { recommendationsService } from './recommendations.service';

vi.mock('../../config/database', () => ({
  default: {
    performanceRecord: {
      findMany: vi.fn(),
    },
    lesson: {
      findMany: vi.fn(),
    },
    learningMaterial: {
      findMany: vi.fn(),
    },
    recommendation: {
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    }
  }
}));

describe('RecommendationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations for weak performance records', async () => {
      const mockPerformance = [
        {
          id: 'pr-1',
          studentId: 'student-1',
          subjectId: 'sub-1',
          topicId: 'topic-1',
          averagePercentage: 45,
          topic: { id: 'topic-1', name: 'Algebra' }
        }
      ];
      const mockLessons = [
        { id: 'les-1', title: 'Algebra Intro', topicId: 'topic-1', isPublished: true }
      ];
      const mockMaterials = [
        { id: 'mat-1', title: 'Algebra Guide', topicId: 'topic-1', isPublished: true }
      ];

      vi.mocked(prisma.performanceRecord.findMany).mockResolvedValue(mockPerformance as any);
      vi.mocked(prisma.lesson.findMany).mockResolvedValue(mockLessons as any);
      vi.mocked(prisma.learningMaterial.findMany).mockResolvedValue(mockMaterials as any);
      vi.mocked(prisma.recommendation.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.recommendation.create).mockResolvedValue({ id: 'rec-1' } as any);

      const result = await recommendationsService.generateRecommendations('student-1', 'sub-1');

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);

      // Verify that create was called for Lesson, Material, and Practice Questions
      expect(prisma.recommendation.create).toHaveBeenCalledTimes(3);
    });

    it('should skip duplicate recommendation generation', async () => {
      const mockPerformance = [
        {
          id: 'pr-1',
          studentId: 'student-1',
          subjectId: 'sub-1',
          topicId: 'topic-1',
          averagePercentage: 45,
          topic: { id: 'topic-1', name: 'Algebra' }
        }
      ];

      vi.mocked(prisma.performanceRecord.findMany).mockResolvedValue(mockPerformance as any);
      vi.mocked(prisma.lesson.findMany).mockResolvedValue([] as any);
      vi.mocked(prisma.learningMaterial.findMany).mockResolvedValue([] as any);
      // Mock existing practice recommendation
      vi.mocked(prisma.recommendation.findFirst).mockResolvedValue({ id: 'existing-rec' } as any);

      await recommendationsService.generateRecommendations('student-1', 'sub-1');

      expect(prisma.recommendation.create).not.toHaveBeenCalled();
    });
  });

  describe('markCompleted', () => {
    it('should mark the recommendation isCompleted as true', async () => {
      vi.mocked(prisma.recommendation.update).mockResolvedValue({ id: 'rec-1', isCompleted: true } as any);

      const result = await recommendationsService.markCompleted('rec-1');

      expect(result.isCompleted).toBe(true);
      expect(prisma.recommendation.update).toHaveBeenCalledWith({
        where: { id: 'rec-1' },
        data: { isCompleted: true, completedAt: expect.any(Date) }
      });
    });
  });
});

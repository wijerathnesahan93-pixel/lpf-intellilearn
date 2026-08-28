import { vi, describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../config/database';
import { analyticsService } from './analytics.service';

vi.mock('../../config/database', () => ({
  default: {
    performanceRecord: {
      findMany: vi.fn(),
    }
  }
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStudentPerformance', () => {
    it('should query performance records for a studentId', async () => {
      const mockRecords = [
        { id: 'pr-1', studentId: 'student-1', averagePercentage: 80, level: 'STRONG' }
      ];
      vi.mocked(prisma.performanceRecord.findMany).mockResolvedValue(mockRecords as any);

      const result = await analyticsService.getStudentPerformance('student-1');

      expect(result).toEqual(mockRecords);
      expect(prisma.performanceRecord.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student-1' },
        include: { subject: true, topic: true }
      });
    });
  });

  describe('getWeakTopics', () => {
    it('should query records where level is WEAK', async () => {
      const mockRecords = [
        { id: 'pr-2', studentId: 'student-1', averagePercentage: 40, level: 'WEAK' }
      ];
      vi.mocked(prisma.performanceRecord.findMany).mockResolvedValue(mockRecords as any);

      const result = await analyticsService.getWeakTopics('student-1');

      expect(result).toEqual(mockRecords);
      expect(prisma.performanceRecord.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student-1', level: 'WEAK' },
        include: { topic: true, subject: true }
      });
    });
  });

  describe('getStrongTopics', () => {
    it('should query records where level is STRONG', async () => {
      const mockRecords = [
        { id: 'pr-3', studentId: 'student-1', averagePercentage: 90, level: 'STRONG' }
      ];
      vi.mocked(prisma.performanceRecord.findMany).mockResolvedValue(mockRecords as any);

      const result = await analyticsService.getStrongTopics('student-1');

      expect(result).toEqual(mockRecords);
      expect(prisma.performanceRecord.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student-1', level: 'STRONG' },
        include: { topic: true, subject: true }
      });
    });
  });
});

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { analyticsService } from './analytics.service';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import prisma from '../../config/database';

export const analyticsController = {
  getStudentPerformance: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      
      if (req.user?.role === 'STUDENT') {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student || student.id !== studentId) {
          throw new ForbiddenError('You can only view your own performance');
        }
      }
      
      const data = await analyticsService.getStudentPerformance(studentId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getSubjectAnalytics: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { subjectId } = req.params;
      const { classId } = req.query;
      const data = await analyticsService.getSubjectAnalytics(subjectId, classId as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  calculatePerformance: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { studentId, subjectId } = req.params;
      const data = await analyticsService.calculatePerformance(studentId, subjectId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getClassPerformance: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { classId } = req.params;
      const data = await analyticsService.getClassPerformance(classId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { recommendationsService } from './recommendations.service';
import { ForbiddenError } from '../../utils/errors';
import prisma from '../../config/database';

export const recommendationsController = {
  generateRecommendations: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { studentId, subjectId } = req.params;
      const data = await recommendationsService.generateRecommendations(studentId, subjectId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  listMyRecommendations: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user?.role !== 'STUDENT') throw new ForbiddenError('Only students can access this');
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student) throw new ForbiddenError('Student profile not found');
      
      const data = await recommendationsService.getRecommendations(student.id, req.query);
      res.json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  },

  listStudentRecommendations: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;

      if (req.user?.role === 'PARENT') {
        const parent = await prisma.parent.findUnique({ where: { userId: req.user.id } });
        if (!parent) throw new ForbiddenError('Parent profile not found');

        const link = await prisma.parentChild.findUnique({
          where: {
            parentId_studentId: {
              parentId: parent.id,
              studentId
            }
          }
        });
        if (!link) throw new ForbiddenError('You are not authorized to view this student\'s recommendations');
      }

      const data = await recommendationsService.getRecommendations(studentId, req.query);
      res.json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  },

  markCompleted: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = await recommendationsService.markCompleted(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

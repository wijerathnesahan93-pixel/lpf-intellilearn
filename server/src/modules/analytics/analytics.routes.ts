import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { AuthRequest } from '../../types';

const router = Router();

router.use(authenticate);

router.get('/student/:studentId', authorize('ADMIN', 'TEACHER', 'STUDENT'), (req, res, next) => analyticsController.getStudentPerformance(req as AuthRequest, res, next));
router.get('/subject/:subjectId', authorize('ADMIN', 'TEACHER'), (req, res, next) => analyticsController.getSubjectAnalytics(req as AuthRequest, res, next));
router.post('/calculate/:studentId/:subjectId', authorize('ADMIN', 'TEACHER'), (req, res, next) => analyticsController.calculatePerformance(req as AuthRequest, res, next));
router.get('/class/:classId', authorize('ADMIN', 'TEACHER'), (req, res, next) => analyticsController.getClassPerformance(req as AuthRequest, res, next));

export default router;

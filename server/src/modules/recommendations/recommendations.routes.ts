import { Router } from 'express';
import { recommendationsController } from './recommendations.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { AuthRequest } from '../../types';

const router = Router();

router.use(authenticate);

router.post('/generate/:studentId/:subjectId', authorize('ADMIN', 'TEACHER'), (req, res, next) => recommendationsController.generateRecommendations(req as AuthRequest, res, next));
router.get('/', authorize('STUDENT'), (req, res, next) => recommendationsController.listMyRecommendations(req as AuthRequest, res, next));
router.get('/student/:studentId', authorize('ADMIN', 'TEACHER', 'PARENT'), (req, res, next) => recommendationsController.listStudentRecommendations(req as AuthRequest, res, next));
router.put('/:id/complete', authorize('STUDENT'), (req, res, next) => recommendationsController.markCompleted(req as AuthRequest, res, next));

export default router;

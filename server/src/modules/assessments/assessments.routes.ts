import { Router } from 'express';
import { assessmentController } from './assessments.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createAssessmentSchema, updateAssessmentSchema, submitAttemptSchema } from './assessments.validation';
import { AuthRequest } from '../../types';

const router = Router();

router.use(authenticate);

// List and get
router.get(
  '/',
  authorize('ADMIN', 'TEACHER', 'STUDENT'),
  (req, res, next) => assessmentController.list(req as AuthRequest, res, next)
);

router.post(
  '/',
  authorize('TEACHER'),
  validate(createAssessmentSchema),
  (req, res, next) => assessmentController.create(req as AuthRequest, res, next)
);

router.get(
  '/:id',
  (req, res, next) => assessmentController.getById(req as AuthRequest, res, next)
);

router.put(
  '/:id',
  authorize('TEACHER'),
  validate(updateAssessmentSchema),
  (req, res, next) => assessmentController.update(req as AuthRequest, res, next)
);

router.delete(
  '/:id',
  authorize('ADMIN', 'TEACHER'),
  (req, res, next) => assessmentController.delete(req as AuthRequest, res, next)
);

// Attempts
router.post(
  '/:id/start',
  authorize('STUDENT'),
  (req, res, next) => assessmentController.startAttempt(req as AuthRequest, res, next)
);

router.post(
  '/:id/submit',
  authorize('STUDENT'),
  validate(submitAttemptSchema),
  (req, res, next) => assessmentController.submitAttempt(req as AuthRequest, res, next)
);

router.get(
  '/:id/attempts',
  authorize('TEACHER', 'STUDENT'),
  (req, res, next) => assessmentController.getAttempts(req as AuthRequest, res, next)
);

// Get specific result by attempt ID
router.get(
  '/attempts/:id/results',
  authorize('TEACHER', 'ADMIN', 'STUDENT'),
  (req, res, next) => assessmentController.getResults(req as AuthRequest, res, next)
);

export default router;

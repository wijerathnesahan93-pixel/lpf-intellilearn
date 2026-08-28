import { Router } from 'express';
import { assignmentController } from './assignments.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  submitAssignmentSchema,
  reviewSubmissionSchema
} from './assignments.validation';
import { AuthRequest } from '../../types';

const router = Router();

router.use(authenticate);

// Submissions - My (STUDENT)
router.get(
  '/my-submissions',
  authorize('STUDENT'),
  (req, res, next) => assignmentController.getMySubmissions(req as AuthRequest, res, next)
);

// Assignments
router.get(
  '/',
  authorize('ADMIN', 'TEACHER', 'STUDENT'),
  (req, res, next) => assignmentController.list(req as AuthRequest, res, next)
);

router.post(
  '/',
  authorize('TEACHER'),
  validate(createAssignmentSchema),
  (req, res, next) => assignmentController.create(req as AuthRequest, res, next)
);

router.get(
  '/:id',
  (req, res, next) => assignmentController.getById(req as AuthRequest, res, next)
);

router.put(
  '/:id',
  authorize('TEACHER'),
  validate(updateAssignmentSchema),
  (req, res, next) => assignmentController.update(req as AuthRequest, res, next)
);

router.delete(
  '/:id',
  authorize('ADMIN', 'TEACHER'),
  (req, res, next) => assignmentController.delete(req as AuthRequest, res, next)
);

// Submissions - Get/Review (TEACHER, ADMIN)
router.get(
  '/:id/submissions',
  authorize('ADMIN', 'TEACHER'),
  (req, res, next) => assignmentController.getSubmissions(req as AuthRequest, res, next)
);

router.post(
  '/:id/submit',
  authorize('STUDENT'),
  validate(submitAssignmentSchema),
  (req, res, next) => assignmentController.submitAssignment(req as AuthRequest, res, next)
);

router.put(
  '/submissions/:submissionId/review',
  authorize('TEACHER'),
  validate(reviewSubmissionSchema),
  (req, res, next) => assignmentController.reviewSubmission(req as AuthRequest, res, next)
);

export default router;

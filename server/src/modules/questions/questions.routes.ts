import { Router } from 'express';
import { questionController } from './questions.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createQuestionSchema, updateQuestionSchema } from './questions.validation';
import { AuthRequest } from '../../types';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'TEACHER'));

router.get(
  '/',
  (req, res, next) => questionController.list(req as AuthRequest, res, next)
);

router.post(
  '/',
  validate(createQuestionSchema),
  (req, res, next) => questionController.create(req as AuthRequest, res, next)
);

router.get(
  '/:id',
  (req, res, next) => questionController.getById(req as AuthRequest, res, next)
);

router.put(
  '/:id',
  validate(updateQuestionSchema),
  (req, res, next) => questionController.update(req as AuthRequest, res, next)
);

router.delete(
  '/:id',
  (req, res, next) => questionController.delete(req as AuthRequest, res, next)
);

export default router;

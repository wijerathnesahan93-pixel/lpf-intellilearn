import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { subjectsController } from './subjects.controller';
import { createSubjectSchema, updateSubjectSchema } from './subjects.validation';
import { AuthRequest } from '../../types';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => subjectsController.list(req as AuthRequest, res, next));
router.get('/:id', (req, res, next) => subjectsController.get(req as AuthRequest, res, next));

router.use(authorize('ADMIN'));
router.post('/', validate(createSubjectSchema), (req, res, next) => subjectsController.create(req as AuthRequest, res, next));
router.put('/:id', validate(updateSubjectSchema), (req, res, next) => subjectsController.update(req as AuthRequest, res, next));
router.delete('/:id', (req, res, next) => subjectsController.delete(req as AuthRequest, res, next));

export default router;

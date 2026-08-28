import { Router } from 'express';
import { gradesController } from './grades.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createGradeSchema, updateGradeSchema } from './grades.validation';
import { AuthRequest } from '../../types';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', (req, res, next) => gradesController.list(req as AuthRequest, res, next));
router.get('/:id', (req, res, next) => gradesController.getById(req as AuthRequest, res, next));
router.post('/', validate(createGradeSchema), (req, res, next) => gradesController.create(req as AuthRequest, res, next));
router.patch('/:id', validate(updateGradeSchema), (req, res, next) => gradesController.update(req as AuthRequest, res, next));
router.delete('/:id', (req, res, next) => gradesController.delete(req as AuthRequest, res, next));

export default router;

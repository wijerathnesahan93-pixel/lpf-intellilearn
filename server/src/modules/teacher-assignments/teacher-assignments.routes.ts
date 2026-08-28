import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { teacherAssignmentsController } from './teacher-assignments.controller';
import { createTeacherAssignmentSchema } from './teacher-assignments.validation';
import { AuthRequest } from '../../types';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => teacherAssignmentsController.list(req as AuthRequest, res, next));
router.get('/:id', (req, res, next) => teacherAssignmentsController.get(req as AuthRequest, res, next));

router.use(authorize('ADMIN'));
router.post('/', validate(createTeacherAssignmentSchema), (req, res, next) => teacherAssignmentsController.create(req as AuthRequest, res, next));
router.delete('/:id', (req, res, next) => teacherAssignmentsController.delete(req as AuthRequest, res, next));

export default router;

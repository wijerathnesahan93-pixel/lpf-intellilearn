import { Router } from 'express';
import { StudentsController } from './students.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createStudentSchema, updateStudentSchema } from './students.validation';
import { AuthRequest } from '../../types';

const router = Router();
const controller = new StudentsController();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', (req, res, next) => controller.list(req as AuthRequest, res, next));
router.get('/:id', (req, res, next) => controller.getById(req as AuthRequest, res, next));
router.post('/', validate(createStudentSchema), (req, res, next) => controller.create(req as AuthRequest, res, next));
router.put('/:id', validate(updateStudentSchema), (req, res, next) => controller.update(req as AuthRequest, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req as AuthRequest, res, next));

export default router;

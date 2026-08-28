import { Router } from 'express';
import { CoursesController } from './courses.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createCourseSchema, updateCourseSchema } from './courses.validation';
import { AuthRequest } from '../../types';

const router = Router();
const controller = new CoursesController();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', (req, res, next) => controller.list(req as AuthRequest, res, next));
router.get('/:id', (req, res, next) => controller.getById(req as AuthRequest, res, next));
router.post('/', validate(createCourseSchema), (req, res, next) => controller.create(req as AuthRequest, res, next));
router.put('/:id', validate(updateCourseSchema), (req, res, next) => controller.update(req as AuthRequest, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req as AuthRequest, res, next));

export default router;

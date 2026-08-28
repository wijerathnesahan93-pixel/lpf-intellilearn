import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { lessonsController } from './lessons.controller';
import { createLessonSchema, updateLessonSchema } from './lessons.validation';
import { AuthRequest } from '../../types';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => lessonsController.list(req as AuthRequest, res, next));
router.get('/:id', (req, res, next) => lessonsController.get(req as AuthRequest, res, next));

router.use(authorize('ADMIN', 'TEACHER'));
router.post('/', validate(createLessonSchema), (req, res, next) => lessonsController.create(req as AuthRequest, res, next));
router.put('/:id', validate(updateLessonSchema), (req, res, next) => lessonsController.update(req as AuthRequest, res, next));
router.delete('/:id', (req, res, next) => lessonsController.delete(req as AuthRequest, res, next));

export default router;

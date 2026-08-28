import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { enrollmentsController } from './enrollments.controller';
import { createEnrollmentSchema, bulkEnrollSchema } from './enrollments.validation';
import { AuthRequest } from '../../types';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => enrollmentsController.list(req as AuthRequest, res, next));
router.get('/:id', (req, res, next) => enrollmentsController.get(req as AuthRequest, res, next));

router.use(authorize('ADMIN'));
router.post('/', validate(createEnrollmentSchema), (req, res, next) => enrollmentsController.create(req as AuthRequest, res, next));
router.post('/bulk', validate(bulkEnrollSchema), (req, res, next) => enrollmentsController.bulkEnroll(req as AuthRequest, res, next));
router.delete('/:id', (req, res, next) => enrollmentsController.delete(req as AuthRequest, res, next));

export default router;

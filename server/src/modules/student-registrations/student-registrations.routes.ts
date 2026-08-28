import { Router } from 'express';
import { studentRegistrationsController } from './student-registrations.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { AuthRequest } from '../../types';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', (req, res, next) => studentRegistrationsController.list(req as AuthRequest, res, next));
router.get('/:id', (req, res, next) => studentRegistrationsController.getById(req as AuthRequest, res, next));
router.post('/:id/approve', (req, res, next) => studentRegistrationsController.approve(req as AuthRequest, res, next));
router.post('/:id/reject', (req, res, next) => studentRegistrationsController.reject(req as AuthRequest, res, next));

export default router;

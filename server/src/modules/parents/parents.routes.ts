import { Router } from 'express';
import { ParentsController } from './parents.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createParentSchema, updateParentSchema, linkChildSchema } from './parents.validation';
import { AuthRequest } from '../../types';

const router = Router();
const controller = new ParentsController();

router.use(authenticate);

// Special route for PARENT role
router.get('/my-children', authorize('PARENT'), (req, res, next) => controller.getChildren(req as AuthRequest, res, next));
router.get('/children/:studentId', authorize('PARENT'), (req, res, next) => controller.getChildDashboard(req as AuthRequest, res, next));

// CRUD routes for ADMIN role
router.get('/', authorize('ADMIN'), (req, res, next) => controller.list(req as AuthRequest, res, next));
router.get('/:id', authorize('ADMIN'), (req, res, next) => controller.getById(req as AuthRequest, res, next));
router.post('/', authorize('ADMIN'), validate(createParentSchema), (req, res, next) => controller.create(req as AuthRequest, res, next));
router.put('/:id', authorize('ADMIN'), validate(updateParentSchema), (req, res, next) => controller.update(req as AuthRequest, res, next));
router.delete('/:id', authorize('ADMIN'), (req, res, next) => controller.delete(req as AuthRequest, res, next));

router.post('/:id/children', authorize('ADMIN'), validate(linkChildSchema), (req, res, next) => controller.linkChild(req as AuthRequest, res, next));
router.delete('/:id/children/:studentId', authorize('ADMIN'), (req, res, next) => controller.unlinkChild(req as AuthRequest, res, next));

export default router;

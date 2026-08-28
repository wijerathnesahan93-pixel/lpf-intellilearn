import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { configController } from './config.controller';
import { createConfigSchema, updateConfigSchema } from './config.validation';
import { AuthRequest } from '../../types';

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/', (req, res, next) => configController.list(req as AuthRequest, res, next));
router.get('/:key', (req, res, next) => configController.getByKey(req as AuthRequest, res, next));
router.post('/', validate(createConfigSchema), (req, res, next) => configController.create(req as AuthRequest, res, next));
router.put('/:key', validate(updateConfigSchema), (req, res, next) => configController.update(req as AuthRequest, res, next));

export default router;

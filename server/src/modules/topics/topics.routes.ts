import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { topicsController } from './topics.controller';
import { createTopicSchema, updateTopicSchema } from './topics.validation';
import { AuthRequest } from '../../types';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => topicsController.list(req as AuthRequest, res, next));
router.get('/:id', (req, res, next) => topicsController.get(req as AuthRequest, res, next));

router.use(authorize('ADMIN', 'TEACHER'));
router.post('/', validate(createTopicSchema), (req, res, next) => topicsController.create(req as AuthRequest, res, next));
router.put('/:id', validate(updateTopicSchema), (req, res, next) => topicsController.update(req as AuthRequest, res, next));
router.delete('/:id', (req, res, next) => topicsController.delete(req as AuthRequest, res, next));

export default router;

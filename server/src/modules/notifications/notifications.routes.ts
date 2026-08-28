import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { AuthRequest } from '../../types';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => notificationsController.list(req as AuthRequest, res, next));
router.get('/unread-count', (req, res, next) => notificationsController.getUnreadCount(req as AuthRequest, res, next));
router.put('/:id/read', (req, res, next) => notificationsController.markAsRead(req as AuthRequest, res, next));
router.put('/read-all', (req, res, next) => notificationsController.markAllAsRead(req as AuthRequest, res, next));

export default router;

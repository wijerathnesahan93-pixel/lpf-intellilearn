import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { notificationsService } from './notifications.service';

export const notificationsController = {
  list: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = await notificationsService.list(req.user!.id, req.query);
      res.json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  },

  getUnreadCount: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const count = await notificationsService.getUnreadCount(req.user!.id);
      res.json({ success: true, data: count });
    } catch (error) {
      next(error);
    }
  },

  markAsRead: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = await notificationsService.markAsRead(id, req.user!.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  markAllAsRead: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await notificationsService.markAllAsRead(req.user!.id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};

import { vi, describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../config/database';
import { notificationsService } from './notifications.service';

vi.mock('../../config/database', () => ({
  default: {
    notification: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
    }
  }
}));

describe('NotificationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should query notifications for a userId', async () => {
      const mockNotifications = [
        { id: 'notif-1', userId: 'user-1', title: 'New Exam Scheduled', isRead: false }
      ];
      vi.mocked(prisma.notification.count).mockResolvedValue(1);
      vi.mocked(prisma.notification.findMany).mockResolvedValue(mockNotifications as any);

      const result = await notificationsService.list('user-1', { page: 1, limit: 10 });

      expect(result.data).toEqual(mockNotifications);
      expect(prisma.notification.findMany).toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should set isRead as true for a valid notification owned by user', async () => {
      const mockNotification = { id: 'notif-1', userId: 'user-1', isRead: false };
      
      vi.mocked(prisma.notification.findUnique).mockResolvedValue(mockNotification as any);
      vi.mocked(prisma.notification.update).mockResolvedValue({ ...mockNotification, isRead: true } as any);

      const result = await notificationsService.markAsRead('notif-1', 'user-1');

      expect(result.isRead).toBe(true);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { isRead: true }
      });
    });

    it('should throw Error if notification is not owned by user', async () => {
      const mockNotification = { id: 'notif-1', userId: 'user-different', isRead: false };
      vi.mocked(prisma.notification.findUnique).mockResolvedValue(mockNotification as any);

      await expect(
        notificationsService.markAsRead('notif-1', 'user-1')
      ).rejects.toThrow('Not found');
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications of user to read', async () => {
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 5 } as any);

      const result = await notificationsService.markAllAsRead('user-1');

      expect(result.count).toBe(5);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        data: { isRead: true }
      });
    });
  });

  describe('create', () => {
    it('should insert a new notification record', async () => {
      const mockNotifData = {
        userId: 'user-1',
        title: 'New Quiz Alert',
        message: 'Quiz 2 has been published.',
        type: 'NEW_ASSESSMENT',
        linkUrl: '/student/assessments'
      };

      vi.mocked(prisma.notification.create).mockResolvedValue({ id: 'notif-new', ...mockNotifData } as any);

      const result = await notificationsService.create('user-1', 'New Quiz Alert', 'Quiz 2 has been published.', 'NEW_ASSESSMENT', '/student/assessments');

      expect(result.id).toBe('notif-new');
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          title: 'New Quiz Alert',
          message: 'Quiz 2 has been published.',
          type: 'NEW_ASSESSMENT',
          linkUrl: '/student/assessments',
          isRead: false
        }
      });
    });
  });
});

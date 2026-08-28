import prisma from '../../config/database';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';
import { NotificationType } from '@prisma/client';

export const notificationsService = {
  list: async (userId: string, params: any) => {
    const page = params.page ? parseInt(params.page, 10) : 1;
    const limit = params.limit ? parseInt(params.limit, 10) : 10;
    const skip = (page - 1) * limit;
    const where: any = { userId };
    
    if (params.isRead !== undefined) {
      where.isRead = params.isRead === 'true';
    }

    const [total, data] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, { page, limit })
    };
  },

  markAsRead: async (id: string, userId: string) => {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) throw new Error('Not found');
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  },

  markAllAsRead: async (userId: string) => {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  },

  getUnreadCount: async (userId: string) => {
    return prisma.notification.count({
      where: { userId, isRead: false }
    });
  },

  create: async (userId: string, title: string, message: string, type: string, linkUrl?: string) => {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type as NotificationType,
        linkUrl,
        isRead: false
      }
    });
  }
};

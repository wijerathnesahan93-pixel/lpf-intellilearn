import prisma from '../../config/database';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

export const recommendationsService = {
  generateRecommendations: async (studentId: string, subjectId: string) => {
    // Placeholder implementation
    return { success: true };
  },

  getRecommendations: async (studentId: string, params: any) => {
    const page = params.page ? parseInt(params.page, 10) : 1;
    const limit = params.limit ? parseInt(params.limit, 10) : 10;
    const skip = (page - 1) * limit;
    const where: any = { studentId };
    
    if (params.isCompleted !== undefined) {
      where.isCompleted = params.isCompleted === 'true';
    }
    if (params.subjectId) {
      where.subjectId = params.subjectId;
    }

    const [total, data] = await Promise.all([
      prisma.recommendation.count({ where }),
      prisma.recommendation.findMany({
        where,
        skip,
        take: limit,
        include: { subject: true, topic: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, { page, limit })
    };
  },

  markCompleted: async (id: string) => {
    return prisma.recommendation.update({
      where: { id },
      data: { isCompleted: true }
    });
  }
};

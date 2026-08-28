import prisma from '../../config/database';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

export const recommendationsService = {
  generateRecommendations: async (studentId: string, subjectId: string) => {
    // 1. Analyze performance & find weak topics (averagePercentage < 50)
    const weakRecords = await prisma.performanceRecord.findMany({
      where: {
        studentId,
        subjectId,
        topicId: { not: null },
        averagePercentage: { lt: 50 } // Configurable weak threshold (<50%)
      },
      include: { topic: true }
    });

    for (const record of weakRecords) {
      if (!record.topicId) continue;

      // 2. Find lessons for this topic
      const lessons = await prisma.lesson.findMany({
        where: { topicId: record.topicId, isPublished: true }
      });

      // 3. Find learning materials for this topic
      const materials = await prisma.learningMaterial.findMany({
        where: { topicId: record.topicId, isPublished: true }
      });

      // 4. Create recommendation for lesson if not already recommended
      for (const lesson of lessons) {
        const existing = await prisma.recommendation.findFirst({
          where: { studentId, topicId: record.topicId, type: 'LESSON', resourceId: lesson.id }
        });
        if (!existing) {
          await prisma.recommendation.create({
            data: {
              studentId,
              subjectId,
              topicId: record.topicId,
              type: 'LESSON',
              message: `Your score in ${record.topic?.name} is ${Math.round(record.averagePercentage)}%. Review the lesson "${lesson.title}" to strengthen your understanding.`,
              resourceId: lesson.id,
              resourceType: 'LESSON'
            }
          });
        }
      }

      // 5. Create recommendation for material if not already recommended
      for (const mat of materials) {
        const existing = await prisma.recommendation.findFirst({
          where: { studentId, topicId: record.topicId, type: 'MATERIAL', resourceId: mat.id }
        });
        if (!existing) {
          await prisma.recommendation.create({
            data: {
              studentId,
              subjectId,
              topicId: record.topicId,
              type: 'MATERIAL',
              message: `Practice with the study material "${mat.title}" to reinforce your ${record.topic?.name} concepts.`,
              resourceId: mat.id,
              resourceType: 'MATERIAL'
            }
          });
        }
      }

      // 6. Generate generic practice request
      const existingPractice = await prisma.recommendation.findFirst({
        where: { studentId, topicId: record.topicId, type: 'PRACTICE_QUESTIONS' }
      });
      if (!existingPractice) {
        await prisma.recommendation.create({
          data: {
            studentId,
            subjectId,
            topicId: record.topicId,
            type: 'PRACTICE_QUESTIONS',
            message: `Solve practice questions on ${record.topic?.name} to improve your mastery.`
          }
        });
      }
    }

    return { success: true, count: weakRecords.length };
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
      data: { isCompleted: true, completedAt: new Date() }
    });
  }
};

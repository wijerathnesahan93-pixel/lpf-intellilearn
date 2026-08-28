import prisma from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';

export class QuestionService {
  async list(params: { page: number; limit: number; subjectId?: string; topicId?: string; type?: string; difficulty?: string; teacherId?: string; role: string }) {
    const { page, limit, subjectId, topicId, type, difficulty, teacherId, role } = params;
    const skip = (page - 1) * limit;
    
    let where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (topicId) where.topicId = topicId;
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;
    
    if (role === 'TEACHER' && teacherId) {
      const teacher = await prisma.teacher.findUnique({ where: { userId: teacherId } });
      if (!teacher) throw new ForbiddenError('Teacher profile not found');
      where.teacherId = teacher.id;
    }
    
    const [total, data] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        include: {
          subject: { select: { name: true } },
          topic: { select: { name: true } },
          _count: { select: { options: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);
    
    return { data, meta: buildPaginationMeta(total, params) };
  }
  
  async getById(id: string) {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        options: true,
        subject: { select: { name: true } },
        topic: { select: { name: true } }
      }
    });
    
    if (!question) throw new NotFoundError('Question not found');
    return question;
  }
  
  async create(data: any, userId: string) {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) throw new ForbiddenError('Teacher profile not found');

    const { options, ...questionData } = data;
    
    return prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          ...questionData,
          teacherId: teacher.id,
          options: {
            create: options
          }
        },
        include: { options: true }
      });
      return question;
    });
  }
  
  async update(id: string, data: any, userId: string, role: string) {
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) throw new NotFoundError('Question not found');
    
    if (role !== 'ADMIN') {
      const teacher = await prisma.teacher.findUnique({ where: { userId } });
      if (!teacher || question.teacherId !== teacher.id) {
        throw new ForbiddenError('Only the creator can update this question');
      }
    }
    
    const { options, ...questionData } = data;
    
    return prisma.$transaction(async (tx) => {
      if (options) {
        await tx.questionOption.deleteMany({ where: { questionId: id } });
      }
      
      const teacher = await tx.teacher.findUnique({ where: { userId } });
      const teacherId = teacher ? teacher.id : question.teacherId;

      return tx.question.update({
        where: { id },
        data: {
          ...questionData,
          teacherId,
          ...(options && { options: { create: options } })
        },
        include: { options: true }
      });
    });
  }
  
  async delete(id: string, userId: string, role: string) {
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) throw new NotFoundError('Question not found');
    
    if (role !== 'ADMIN') {
      const teacher = await prisma.teacher.findUnique({ where: { userId } });
      if (!teacher || question.teacherId !== teacher.id) {
        throw new ForbiddenError('Only the creator or admin can delete this question');
      }
    }
    
    await prisma.question.delete({ where: { id } });
  }
}

export const questionService = new QuestionService();

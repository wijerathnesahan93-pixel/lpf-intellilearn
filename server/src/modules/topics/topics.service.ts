import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export class TopicsService {
  async findMany(query: any) {
    const { page = 1, limit = 10, subjectId } = query;
    const skip = (page - 1) * limit;
    const where = subjectId ? { subjectId: String(subjectId) } : {};
    
    const [data, total] = await Promise.all([
      prisma.topic.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { orderIndex: 'asc' },
        include: { subject: { select: { name: true } } }
      }),
      prisma.topic.count({ where })
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: { subject: { select: { name: true } } }
    });
    if (!topic) throw new NotFoundError('Topic not found');
    return topic;
  }

  async create(data: any) {
    return prisma.topic.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.topic.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.topic.delete({ where: { id } });
  }
}
export const topicsService = new TopicsService();

import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export class SubjectsService {
  async findMany(query: any) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { code: { contains: search } }
      ]
    } : {};
    
    const [data, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        include: { course: true, _count: { select: { topics: true } } }
      }),
      prisma.subject.count({ where })
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { course: true, _count: { select: { topics: true } } }
    });
    if (!subject) throw new NotFoundError('Subject not found');
    return subject;
  }

  async create(data: any) {
    return prisma.subject.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.subject.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.subject.delete({ where: { id } });
  }
}
export const subjectsService = new SubjectsService();

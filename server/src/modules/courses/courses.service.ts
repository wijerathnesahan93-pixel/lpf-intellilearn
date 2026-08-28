import prisma from '../../config/database';
import { PaginationParams } from '../../types';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class CoursesService {
  async list(params: PaginationParams, search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          _count: {
            select: { subjects: true }
          }
        },
        orderBy: { name: 'asc' },
      }),
      prisma.course.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subjects: true }
        }
      }
    });

    if (!course) throw new NotFoundError('Course not found');
    return course;
  }

  async create(data: any) {
    const existingCode = await prisma.course.findUnique({ where: { code: data.code } });
    if (existingCode) throw new ConflictError('Course code already in use');

    const course = await prisma.course.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
      }
    });

    return course;
  }

  async update(id: string, data: any) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Course not found');

    if (data.code && data.code !== existing.code) {
      const codeTaken = await prisma.course.findUnique({ where: { code: data.code } });
      if (codeTaken) throw new ConflictError('Course code already in use');
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { subjects: true }
        }
      }
    });

    return updatedCourse;
  }

  async delete(id: string) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Course not found');

    await prisma.course.delete({ where: { id } });
  }
}

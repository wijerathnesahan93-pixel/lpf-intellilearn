import prisma from '../../config/database';
import { PaginationParams } from '../../types';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class ClassesService {
  async list(params: PaginationParams, search?: string) {
    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    
    const [items, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          academicYear: {
            select: { name: true }
          },
          _count: { select: { enrollments: true } }
        },
        orderBy: { name: 'asc' },
      }),
      prisma.class.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: string) {
    const cls = await prisma.class.findUnique({
      where: { id },
      include: {
        academicYear: {
          select: { name: true }
        },
        _count: { select: { enrollments: true } }
      }
    });

    if (!cls) throw new NotFoundError('Class not found');
    return cls;
  }

  async create(data: any) {
    const existing = await prisma.class.findFirst({ 
      where: { 
        name: data.name,
        academicYearId: data.academicYearId 
      } 
    });
    
    if (existing) throw new ConflictError('Class name already exists in this academic year');

    const cls = await prisma.class.create({
      data: {
        name: data.name,
        academicYearId: data.academicYearId,
        grade: data.grade,
        section: data.section,
        capacity: data.capacity,
      },
      include: {
        academicYear: {
          select: { name: true }
        }
      }
    });

    return cls;
  }

  async update(id: string, data: any) {
    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Class not found');

    if (data.name || data.academicYearId) {
      const name = data.name || existing.name;
      const academicYearId = data.academicYearId || existing.academicYearId;
      
      const nameTaken = await prisma.class.findFirst({ 
        where: { 
          name, 
          academicYearId,
          id: { not: id } 
        } 
      });
      if (nameTaken) throw new ConflictError('Class name already exists in this academic year');
    }

    const updatedCls = await prisma.class.update({
      where: { id },
      data,
      include: {
        academicYear: {
          select: { name: true }
        },
        _count: { select: { enrollments: true } }
      }
    });

    return updatedCls;
  }

  async delete(id: string) {
    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Class not found');

    await prisma.class.delete({ where: { id } });
  }
}

import prisma from '../../config/database';
import { PaginationParams } from '../../types';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class AcademicYearsService {
  async list(params: PaginationParams, search?: string) {
    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    
    const [items, total] = await Promise.all([
      prisma.academicYear.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { startDate: 'desc' },
      }),
      prisma.academicYear.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: string) {
    const year = await prisma.academicYear.findUnique({
      where: { id },
    });

    if (!year) throw new NotFoundError('Academic year not found');
    return year;
  }

  async create(data: any) {
    const existing = await prisma.academicYear.findUnique({ where: { name: data.name } });
    if (existing) throw new ConflictError('Academic year name already in use');

    if (data.isCurrent) {
      return prisma.$transaction(async (tx) => {
        await tx.academicYear.updateMany({
          where: { isCurrent: true },
          data: { isCurrent: false },
        });

        return tx.academicYear.create({
          data: {
            name: data.name,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            isCurrent: true,
          }
        });
      });
    } else {
      return prisma.academicYear.create({
        data: {
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          isCurrent: false,
        }
      });
    }
  }

  async update(id: string, data: any) {
    const existing = await prisma.academicYear.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Academic year not found');

    if (data.name && data.name !== existing.name) {
      const nameTaken = await prisma.academicYear.findUnique({ where: { name: data.name } });
      if (nameTaken) throw new ConflictError('Academic year name already in use');
    }

    if (data.isCurrent) {
      return prisma.$transaction(async (tx) => {
        await tx.academicYear.updateMany({
          where: { id: { not: id }, isCurrent: true },
          data: { isCurrent: false },
        });

        return tx.academicYear.update({
          where: { id },
          data: {
            name: data.name,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            isCurrent: true,
          }
        });
      });
    } else {
      return prisma.academicYear.update({
        where: { id },
        data: {
          name: data.name,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          isCurrent: data.isCurrent,
        }
      });
    }
  }

  async delete(id: string) {
    const existing = await prisma.academicYear.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Academic year not found');

    await prisma.academicYear.delete({ where: { id } });
  }
}

import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';

export class GradesService {
  async list() {
    return prisma.grade.findMany({
      orderBy: { number: 'asc' }
    });
  }

  async getById(id: string) {
    const grade = await prisma.grade.findUnique({ where: { id } });
    if (!grade) throw new NotFoundError('Grade not found');
    return grade;
  }

  async create(data: any) {
    const existing = await prisma.grade.findUnique({ where: { number: data.number } });
    if (existing) throw new ConflictError('Grade number already exists');

    return prisma.grade.create({
      data: {
        number: data.number,
        name: data.name,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });
  }

  async update(id: string, data: any) {
    const grade = await prisma.grade.findUnique({ where: { id } });
    if (!grade) throw new NotFoundError('Grade not found');

    if (data.number && data.number !== grade.number) {
      const existing = await prisma.grade.findUnique({ where: { number: data.number } });
      if (existing) throw new ConflictError('Grade number already exists');
    }

    return prisma.grade.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    const grade = await prisma.grade.findUnique({ where: { id } });
    if (!grade) throw new NotFoundError('Grade not found');
    return prisma.grade.delete({ where: { id } });
  }
}

export const gradesService = new GradesService();

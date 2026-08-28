import prisma from '../../config/database';
import { PaginationParams } from '../../types';
import * as bcrypt from 'bcryptjs';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class TeachersService {
  async list(params: PaginationParams, search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { employeeId: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    const [items, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: { id: 'desc' },
      }),
      prisma.teacher.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    if (!teacher) throw new NotFoundError('Teacher not found');
    return teacher;
  }

  async create(data: any) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) throw new ConflictError('Email already in use');

    const existingEmpId = await prisma.teacher.findUnique({ where: { employeeId: data.employeeId } });
    if (existingEmpId) throw new ConflictError('Employee ID already in use');

    const passwordHash = await bcrypt.hash(data.password, 10);
    
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'TEACHER',
        }
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId: data.employeeId,
          qualification: data.qualification,
          specialization: data.specialization,
          phone: data.phone,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      return teacher;
    });
  }

  async update(id: string, data: any) {
    const teacher = await prisma.teacher.findUnique({ where: { id }, include: { user: true } });
    if (!teacher) throw new NotFoundError('Teacher not found');

    if (data.email && data.email !== teacher.user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailTaken) throw new ConflictError('Email already in use');
    }

    if (data.employeeId && data.employeeId !== teacher.employeeId) {
      const empTaken = await prisma.teacher.findUnique({ where: { employeeId: data.employeeId } });
      if (empTaken) throw new ConflictError('Employee ID already in use');
    }

    return prisma.$transaction(async (tx) => {
      const userUpdate: any = {};
      if (data.email) userUpdate.email = data.email;
      if (data.firstName) userUpdate.firstName = data.firstName;
      if (data.lastName) userUpdate.lastName = data.lastName;
      if (data.password) userUpdate.passwordHash = await bcrypt.hash(data.password, 10);

      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: userUpdate,
        });
      }

      const teacherUpdate: any = {};
      if (data.employeeId) teacherUpdate.employeeId = data.employeeId;
      if (data.qualification !== undefined) teacherUpdate.qualification = data.qualification;
      if (data.specialization !== undefined) teacherUpdate.specialization = data.specialization;
      if (data.phone !== undefined) teacherUpdate.phone = data.phone;

      const updatedTeacher = await tx.teacher.update({
        where: { id },
        data: teacherUpdate,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      return updatedTeacher;
    });
  }

  async delete(id: string) {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new NotFoundError('Teacher not found');

    await prisma.$transaction(async (tx) => {
      await tx.teacher.delete({ where: { id } });
      await tx.user.delete({ where: { id: teacher.userId } });
    });
  }
}

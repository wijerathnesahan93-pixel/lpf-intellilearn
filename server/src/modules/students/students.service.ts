import prisma from '../../config/database';
import { PaginationParams } from '../../types';
import * as bcrypt from 'bcryptjs';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class StudentsService {
  async list(params: PaginationParams, search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { admissionNumber: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    const [items, total] = await Promise.all([
      prisma.student.findMany({
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
      prisma.student.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: string) {
    const student = await prisma.student.findUnique({
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

    if (!student) throw new NotFoundError('Student not found');
    return student;
  }

  async create(data: any) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) throw new ConflictError('Email already in use');

    const existingAdmission = await prisma.student.findUnique({ where: { admissionNumber: data.admissionNumber } });
    if (existingAdmission) throw new ConflictError('Admission number already in use');

    const passwordHash = await bcrypt.hash(data.password, 10);
    
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'STUDENT',
        }
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          admissionNumber: data.admissionNumber,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender,
          address: data.address,
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

      return student;
    });
  }

  async update(id: string, data: any) {
    const student = await prisma.student.findUnique({ where: { id }, include: { user: true } });
    if (!student) throw new NotFoundError('Student not found');

    if (data.email && data.email !== student.user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailTaken) throw new ConflictError('Email already in use');
    }

    if (data.admissionNumber && data.admissionNumber !== student.admissionNumber) {
      const admTaken = await prisma.student.findUnique({ where: { admissionNumber: data.admissionNumber } });
      if (admTaken) throw new ConflictError('Admission number already in use');
    }

    return prisma.$transaction(async (tx) => {
      const userUpdate: any = {};
      if (data.email) userUpdate.email = data.email;
      if (data.firstName) userUpdate.firstName = data.firstName;
      if (data.lastName) userUpdate.lastName = data.lastName;
      if (data.password) userUpdate.passwordHash = await bcrypt.hash(data.password, 10);

      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: student.userId },
          data: userUpdate,
        });
      }

      const studentUpdate: any = {};
      if (data.admissionNumber) studentUpdate.admissionNumber = data.admissionNumber;
      if (data.dateOfBirth) studentUpdate.dateOfBirth = new Date(data.dateOfBirth);
      if (data.gender !== undefined) studentUpdate.gender = data.gender;
      if (data.address !== undefined) studentUpdate.address = data.address;
      if (data.phone !== undefined) studentUpdate.phone = data.phone;

      const updatedStudent = await tx.student.update({
        where: { id },
        data: studentUpdate,
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

      return updatedStudent;
    });
  }

  async delete(id: string) {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundError('Student not found');

    await prisma.$transaction(async (tx) => {
      await tx.student.delete({ where: { id } });
      await tx.user.delete({ where: { id: student.userId } });
    });
  }
}

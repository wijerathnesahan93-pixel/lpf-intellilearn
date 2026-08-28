import prisma from '../../config/database';
import { PaginationParams } from '../../types';
import * as bcrypt from 'bcryptjs';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class ParentsService {
  async list(params: PaginationParams, search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    const [items, total] = await Promise.all([
      prisma.parent.findMany({
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
          },
          children: {
            include: {
              student: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { id: 'desc' },
      }),
      prisma.parent.count({ where }),
    ]);

    return { items, total };
  }

  async getById(id: string) {
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        children: {
          include: {
            student: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          }
        }
      }
    });

    if (!parent) throw new NotFoundError('Parent not found');
    return parent;
  }

  async create(data: any) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) throw new ConflictError('Email already in use');

    const passwordHash = await bcrypt.hash(data.password, 10);
    
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'PARENT',
        }
      });

      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          phone: data.phone,
          occupation: data.occupation,
          address: data.address,
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

      if (data.childrenIds && data.childrenIds.length > 0) {
        for (const studentId of data.childrenIds) {
          await tx.parentChild.create({
            data: {
              parentId: parent.id,
              studentId,
              relationship: 'Parent'
            }
          });
        }
      }

      return parent;
    });
  }

  async update(id: string, data: any) {
    const parent = await prisma.parent.findUnique({ where: { id }, include: { user: true } });
    if (!parent) throw new NotFoundError('Parent not found');

    if (data.email && data.email !== parent.user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailTaken) throw new ConflictError('Email already in use');
    }

    return prisma.$transaction(async (tx) => {
      const userUpdate: any = {};
      if (data.email) userUpdate.email = data.email;
      if (data.firstName) userUpdate.firstName = data.firstName;
      if (data.lastName) userUpdate.lastName = data.lastName;
      if (data.password) userUpdate.passwordHash = await bcrypt.hash(data.password, 10);

      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: parent.userId },
          data: userUpdate,
        });
      }

      const parentUpdate: any = {};
      if (data.phone !== undefined) parentUpdate.phone = data.phone;
      if (data.occupation !== undefined) parentUpdate.occupation = data.occupation;
      if (data.address !== undefined) parentUpdate.address = data.address;

      const updatedParent = await tx.parent.update({
        where: { id },
        data: parentUpdate,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          children: true
        }
      });

      return updatedParent;
    });
  }

  async delete(id: string) {
    const parent = await prisma.parent.findUnique({ where: { id } });
    if (!parent) throw new NotFoundError('Parent not found');

    await prisma.$transaction(async (tx) => {
      await tx.parentChild.deleteMany({ where: { parentId: id } });
      await tx.parent.delete({ where: { id } });
      await tx.user.delete({ where: { id: parent.userId } });
    });
  }

  async linkChild(parentId: string, studentId: string, relationship?: string) {
    const parent = await prisma.parent.findUnique({ where: { id: parentId } });
    if (!parent) throw new NotFoundError('Parent not found');

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundError('Student not found');

    const existingLink = await prisma.parentChild.findUnique({
      where: {
        parentId_studentId: {
          parentId,
          studentId,
        }
      }
    });

    if (existingLink) throw new ConflictError('Child already linked to this parent');

    await prisma.parentChild.create({
      data: {
        parentId,
        studentId,
        relationship: relationship || 'Parent',
      }
    });
  }

  async unlinkChild(parentId: string, studentId: string) {
    const link = await prisma.parentChild.findUnique({
      where: {
        parentId_studentId: {
          parentId,
          studentId,
        }
      }
    });

    if (!link) throw new NotFoundError('Link not found');

    await prisma.parentChild.delete({
      where: {
        parentId_studentId: {
          parentId,
          studentId,
        }
      }
    });
  }

  async getChildrenByUser(userId: string) {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: {
        children: {
          include: {
            student: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true }
                }
              }
            }
          }
        }
      }
    });

    if (!parent) throw new NotFoundError('Parent profile not found');
    return parent.children.map((ps: any) => ps.student);
  }
}

import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export class StudentRegistrationsService {
  async list(params: { page: number; limit: number; status?: string }) {
    const { page, limit, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [total, data] = await Promise.all([
      prisma.studentRegistration.count({ where }),
      prisma.studentRegistration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return { data, meta: buildPaginationMeta(total, params) };
  }

  async getById(id: string) {
    const registration = await prisma.studentRegistration.findUnique({
      where: { id }
    });
    if (!registration) throw new NotFoundError('Registration not found');
    return registration;
  }

  async reject(id: string) {
    const registration = await prisma.studentRegistration.findUnique({ where: { id } });
    if (!registration) throw new NotFoundError('Registration not found');
    if (registration.status !== 'PENDING') {
      throw new ConflictError(`Cannot reject a registration that is already ${registration.status.toLowerCase()}`);
    }

    return prisma.studentRegistration.update({
      where: { id },
      data: { status: 'REJECTED' }
    });
  }

  async approve(id: string, classId?: string) {
    const registration = await prisma.studentRegistration.findUnique({ where: { id } });
    if (!registration) throw new NotFoundError('Registration not found');
    if (registration.status !== 'PENDING') {
      throw new ConflictError(`Cannot approve a registration that is already ${registration.status.toLowerCase()}`);
    }

    let targetClass;

    if (classId) {
      targetClass = await prisma.class.findUnique({
        where: { id: classId },
        include: { subjects: true }
      });
      if (!targetClass) throw new NotFoundError('Target class not found');
    } else {
      // Find the current active academic year
      const activeYear = await prisma.academicYear.findFirst({
        where: { isCurrent: true }
      });
      if (!activeYear) {
        throw new NotFoundError('Active academic year not found. Please set a current academic year first.');
      }

      // Find the single class for this grade number in the current academic year
      targetClass = await prisma.class.findFirst({
        where: {
          grade: registration.gradeNumber,
          academicYearId: activeYear.id
        },
        include: { subjects: true }
      });

      // If no class exists for this grade in the active academic year, automatically provision one
      if (!targetClass) {
        targetClass = await prisma.class.create({
          data: {
            name: `Grade ${registration.gradeNumber}`,
            grade: registration.gradeNumber,
            section: 'A',
            capacity: 40,
            academicYearId: activeYear.id
          },
          include: { subjects: true }
        });
      }
    }

    // Check email uniqueness in User table
    const emailTaken = await prisma.user.findUnique({ where: { email: registration.email } });
    if (emailTaken) throw new ConflictError('Student email is already registered in the system');

    // Create admission number
    const count = await prisma.student.count();
    const admissionNumber = 'ADM' + String(1000 + count + 1);

    // Hash default parent password
    const parentPasswordHash = await bcrypt.hash('Password@123', 10);

    return prisma.$transaction(async (tx) => {
      // 1. Create Student User
      const studentUser = await tx.user.create({
        data: {
          email: registration.email,
          passwordHash: registration.passwordHash,
          firstName: registration.firstName,
          lastName: registration.lastName,
          role: UserRole.STUDENT,
          status: 'APPROVED'
        }
      });

      // 2. Create Student Profile
      const student = await tx.student.create({
        data: {
          userId: studentUser.id,
          admissionNumber,
          dateOfBirth: registration.dateOfBirth,
          gender: registration.gender,
          address: registration.address,
          phone: registration.phone
        }
      });

      // 3. Find or Create Parent User & Profile
      let parentUser = await tx.user.findUnique({
        where: { email: registration.parentEmail }
      });

      let parent;
      if (!parentUser) {
        // Create new Parent User
        const nameParts = registration.parentName.trim().split(/\s+/);
        const firstName = nameParts[0] || 'Parent';
        const lastName = nameParts.slice(1).join(' ') || 'Guardian';

        parentUser = await tx.user.create({
          data: {
            email: registration.parentEmail,
            passwordHash: parentPasswordHash,
            firstName,
            lastName,
            role: UserRole.PARENT,
            status: 'APPROVED'
          }
        });

        parent = await tx.parent.create({
          data: {
            userId: parentUser.id,
            phone: registration.parentPhone,
            address: registration.address
          }
        });
      } else {
        if (parentUser.role !== UserRole.PARENT) {
          throw new ConflictError('Parent email is registered with a non-parent role');
        }
        parent = await tx.parent.findUnique({
          where: { userId: parentUser.id }
        });
        if (!parent) {
          parent = await tx.parent.create({
            data: {
              userId: parentUser.id,
              phone: registration.parentPhone
            }
          });
        }
      }

      // 4. Link Parent & Student
      const parentChildExists = await tx.parentChild.findUnique({
        where: {
          parentId_studentId: { parentId: parent.id, studentId: student.id }
        }
      });

      if (!parentChildExists) {
        await tx.parentChild.create({
          data: {
            parentId: parent.id,
            studentId: student.id,
            relationship: registration.relationship || 'Parent'
          }
        });
      }

      // 5. Enroll student in each subject assigned to the class
      for (const classSubject of targetClass.subjects) {
        await tx.enrollment.create({
          data: {
            studentId: student.id,
            classId: targetClass.id,
            subjectId: classSubject.subjectId
          } as any
        });
      }

      // 7. Update Registration Status
      await tx.studentRegistration.update({
        where: { id: registration.id },
        data: { status: 'APPROVED' }
      });

      return { student, studentUser, parent };
    });
  }
}

export const studentRegistrationsService = new StudentRegistrationsService();

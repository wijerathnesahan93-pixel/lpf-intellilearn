import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';

export class EnrollmentsService {
  async findMany(query: any) {
    const { page = 1, limit = 10, studentId, classId, subjectId } = query;
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (studentId) where.studentId = String(studentId);
    if (classId) where.classId = String(classId);
    if (subjectId) where.subjectId = String(subjectId);
    
    const [data, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        include: { 
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
          class: true,
          subject: true
        }
      }),
      prisma.enrollment.count({ where })
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: { 
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        class: true,
        subject: true
      }
    });
    if (!enrollment) throw new NotFoundError('Enrollment not found');
    return enrollment;
  }

  async create(data: any) {
    const existing = await prisma.enrollment.findFirst({
      where: { studentId: data.studentId, subjectId: data.subjectId, classId: data.classId }
    });
    if (existing) throw new ConflictError('Student is already enrolled in this class and subject');
    return prisma.enrollment.create({ data });
  }

  async bulkEnroll(data: any) {
    const results = [];
    for (const studentId of data.studentIds) {
      const existing = await prisma.enrollment.findFirst({
        where: { studentId, subjectId: data.subjectId, classId: data.classId }
      });
      if (!existing) {
        const enrolled = await prisma.enrollment.create({
          data: { studentId, subjectId: data.subjectId, classId: data.classId }
        });
        results.push(enrolled);
      }
    }
    return results;
  }

  async delete(id: string) {
    return prisma.enrollment.delete({ where: { id } });
  }
}
export const enrollmentsService = new EnrollmentsService();

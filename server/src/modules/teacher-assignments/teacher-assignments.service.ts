import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export class TeacherAssignmentsService {
  async findMany(query: any) {
    const { page = 1, limit = 10, teacherId, classId, subjectId } = query;
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (teacherId) where.teacherId = String(teacherId);
    if (classId) where.classId = String(classId);
    if (subjectId) where.subjectId = String(subjectId);
    
    const [data, total] = await Promise.all([
      prisma.teacherSubjectAssignment.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        include: { 
          teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
          class: true,
          subject: true
        }
      }),
      prisma.teacherSubjectAssignment.count({ where })
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string) {
    const assignment = await prisma.teacherSubjectAssignment.findUnique({
      where: { id },
      include: { 
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        class: true,
        subject: true
      }
    });
    if (!assignment) throw new NotFoundError('Assignment not found');
    return assignment;
  }

  async create(data: any) {
    return prisma.teacherSubjectAssignment.create({ data });
  }

  async delete(id: string) {
    return prisma.teacherSubjectAssignment.delete({ where: { id } });
  }
}
export const teacherAssignmentsService = new TeacherAssignmentsService();

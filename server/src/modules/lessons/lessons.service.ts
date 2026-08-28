import prisma from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

export class LessonsService {
  async findMany(query: any, user: any) {
    const { page = 1, limit = 10, subjectId, topicId } = query;
    const skip = (page - 1) * limit;
    
    let where: any = {};
    if (subjectId) where.subjectId = String(subjectId);
    if (topicId) where.topicId = String(topicId);

    if (user.role === 'STUDENT') {
      where.isPublished = true;
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (student) {
        where.subject = {
          enrollments: { some: { studentId: student.id } }
        };
      }
    }
    
    const [data, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { orderIndex: 'asc' },
        include: { 
          subject: true, 
          topic: true,
          teacher: { include: { user: { select: { firstName: true, lastName: true } } } }
        }
      }),
      prisma.lesson.count({ where })
    ]);
    return { data, total, page: Number(page), limit: Number(limit) };
  }

  async findById(id: string, user: any) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { 
        subject: true, 
        topic: true,
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } }
      }
    });
    if (!lesson) throw new NotFoundError('Lesson not found');
    
    if (user.role === 'STUDENT' && !lesson.isPublished) {
      throw new ForbiddenError('Lesson is not published');
    }
    
    return lesson;
  }

  async create(data: any, userId: string) {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) throw new ForbiddenError('Only teachers can create lessons');
    
    return prisma.lesson.create({ 
      data: { ...data, teacherId: teacher.id } 
    });
  }

  async update(id: string, data: any, userId: string, role: string) {
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundError('Lesson not found');

    if (role !== 'ADMIN') {
      const teacher = await prisma.teacher.findUnique({ where: { userId } });
      if (!teacher || lesson.teacherId !== teacher.id) {
        throw new ForbiddenError('Only the creator or admin can update this lesson');
      }
    }

    return prisma.lesson.update({ where: { id }, data });
  }

  async delete(id: string, userId: string, role: string) {
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundError('Lesson not found');

    if (role !== 'ADMIN') {
      const teacher = await prisma.teacher.findUnique({ where: { userId } });
      if (!teacher || lesson.teacherId !== teacher.id) {
        throw new ForbiddenError('Only the creator or admin can delete this lesson');
      }
    }

    return prisma.lesson.delete({ where: { id } });
  }
}
export const lessonsService = new LessonsService();

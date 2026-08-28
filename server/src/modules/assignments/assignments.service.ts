import prisma from '../../config/database';
import { NotFoundError, ConflictError, ForbiddenError } from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';

export class AssignmentService {
  async list(params: { page: number; limit: number; teacherId?: string; studentId?: string; role: string }) {
    const { page, limit, teacherId, studentId, role } = params;
    const skip = (page - 1) * limit;
    
    let where: any = {};
    
    if (role === 'TEACHER' && teacherId) {
      where.teacherId = teacherId;
    } else if (role === 'STUDENT' && studentId) {
      where.isPublished = true;
      // Get student's enrolled classes
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
        select: { classId: true }
      });
      where.classId = { in: enrollments.map(e => e.classId) };
    }
    
    const [total, data] = await Promise.all([
      prisma.assignment.count({ where }),
      prisma.assignment.findMany({
        where,
        skip,
        take: limit,
        include: {
          subject: { select: { name: true } },
          class: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);
    
    return { data, meta: buildPaginationMeta(total, params) };
  }
  
  async getById(id: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        _count: { select: { submissions: true } },
        subject: { select: { name: true } },
        class: { select: { name: true } }
      }
    });
    
    if (!assignment) throw new NotFoundError('Assignment not found');
    return assignment;
  }
  
  async create(data: any, teacherId: string) {
    // Check if teacher is assigned to this subject+class
    const isAssigned = await prisma.teacherSubjectAssignment.findFirst({
      where: { teacherId, subjectId: data.subjectId, classId: data.classId }
    });
    
    if (!isAssigned) {
      throw new ForbiddenError('Teacher is not assigned to this subject and class');
    }
    
    return prisma.assignment.create({
      data: { ...data, teacherId }
    });
  }
  
  async update(id: string, data: any, userId: string, role: string) {
    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundError('Assignment not found');
    
    if (role !== 'ADMIN' && assignment.teacherId !== userId) {
      throw new ForbiddenError('Only the creator can update this assignment');
    }
    
    return prisma.assignment.update({
      where: { id },
      data
    });
  }
  
  async delete(id: string, userId: string, role: string) {
    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundError('Assignment not found');
    
    if (role !== 'ADMIN' && assignment.teacherId !== userId) {
      throw new ForbiddenError('Only the creator or admin can delete this assignment');
    }
    
    await prisma.assignment.delete({ where: { id } });
  }
  
  async getSubmissions(assignmentId: string, params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;
    
    const [total, data] = await Promise.all([
      prisma.assignmentSubmission.count({ where: { assignmentId } }),
      prisma.assignmentSubmission.findMany({
        where: { assignmentId },
        skip,
        take: limit,
        include: {
          student: {
            select: {
              user: { select: { firstName: true, lastName: true } }
            }
          }
        },
        orderBy: { submittedAt: 'desc' }
      })
    ]);
    
    return { data, meta: buildPaginationMeta(total, params) };
  }
  
  async submitAssignment(assignmentId: string, studentId: string, content: string) {
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundError('Assignment not found');
    if (!assignment.isPublished) throw new ForbiddenError('Assignment is not published');
    
    const isEnrolled = await prisma.enrollment.findFirst({
      where: { studentId, classId: assignment.classId }
    });
    if (!isEnrolled) throw new ForbiddenError('Student not enrolled in this class');
    
    const existing = await prisma.assignmentSubmission.findFirst({
      where: { assignmentId, studentId }
    });
    if (existing) throw new ConflictError('Assignment already submitted');
    
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      throw new ForbiddenError('Assignment deadline has passed');
    }
    
    return prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        content,
        submittedAt: new Date(),
        status: 'SUBMITTED'
      }
    });
  }
  
  async reviewSubmission(submissionId: string, teacherId: string, data: any) {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true }
    });
    
    if (!submission) throw new NotFoundError('Submission not found');
    if (submission.assignment.teacherId !== teacherId) {
      throw new ForbiddenError('Only the assigning teacher can review');
    }
    
    return prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        ...data,
        reviewedAt: new Date()
      }
    });
  }
  
  async getMySubmissions(studentId: string, params: { page: number; limit: number }) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;
    
    const [total, data] = await Promise.all([
      prisma.assignmentSubmission.count({ where: { studentId } }),
      prisma.assignmentSubmission.findMany({
        where: { studentId },
        skip,
        take: limit,
        include: {
          assignment: {
            select: { title: true, subject: { select: { name: true } } }
          }
        },
        orderBy: { submittedAt: 'desc' }
      })
    ]);
    
    return { data, meta: buildPaginationMeta(total, params) };
  }
}

export const assignmentService = new AssignmentService();

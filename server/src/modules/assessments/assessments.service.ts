import prisma from '../../config/database';
import { NotFoundError, ConflictError, ForbiddenError } from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';
import { analyticsService } from '../analytics/analytics.service';
import { recommendationsService } from '../recommendations/recommendations.service';

export class AssessmentService {
  async list(params: { page: number; limit: number; teacherId?: string; studentId?: string; role: string }) {
    const { page, limit, teacherId, studentId, role } = params;
    const skip = (page - 1) * limit;
    
    let where: any = {};
    
    if (role === 'TEACHER' && teacherId) {
      const teacher = await prisma.teacher.findUnique({ where: { userId: teacherId } });
      if (!teacher) throw new ForbiddenError('Teacher profile not found');
      where.teacherId = teacher.id;
    } else if (role === 'STUDENT' && studentId) {
      where.isPublished = true;
      const student = await prisma.student.findUnique({ where: { userId: studentId } });
      if (!student) throw new ForbiddenError('Student profile not found');
      
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: student.id },
        include: { class: true }
      });
      const enrolledClassIds = enrollments.map(e => e.classId);
      where.OR = [
        { classId: null },
        { classId: { in: enrolledClassIds } }
      ];
    }
    
    const [total, data] = await Promise.all([
      prisma.assessment.count({ where }),
      prisma.assessment.findMany({
        where,
        skip,
        take: limit,
        include: {
          subject: { select: { name: true } },
          _count: { select: { questions: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);
    
    return { data, meta: buildPaginationMeta(total, params) };
  }
  
  async getById(id: string, role: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        subject: { select: { name: true } },
        questions: {
          include: {
            question: {
              include: {
                options: true
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
    
    if (!assessment) throw new NotFoundError('Assessment not found');
    
    if (role === 'STUDENT') {
      assessment.questions = assessment.questions.map(aq => {
        const q = aq.question;
        const { correctAnswer, ...qWithoutAnswer } = q;
        const optionsWithoutCorrect = q.options.map(opt => {
          const { isCorrect, ...optWithoutCorrect } = opt;
          return optWithoutCorrect as any;
        });
        
        return {
          ...aq,
          question: {
            ...qWithoutAnswer,
            options: optionsWithoutCorrect
          }
        } as any;
      });
    }
    
    return assessment;
  }
  
  async create(data: any, userId: string) {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) throw new ForbiddenError('Teacher profile not found');

    const { questionIds, ...assessmentData } = data;
    const totalMarks = questionIds.reduce((sum: number, q: any) => sum + q.marks, 0);
    
    return prisma.assessment.create({
      data: {
        ...assessmentData,
        teacherId: teacher.id,
        totalMarks,
        questions: {
          create: questionIds
        }
      },
      include: { questions: true }
    });
  }
  
  async update(id: string, data: any, userId: string, role: string) {
    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment) throw new NotFoundError('Assessment not found');
    
    if (role !== 'ADMIN') {
      const teacher = await prisma.teacher.findUnique({ where: { userId } });
      if (!teacher || assessment.teacherId !== teacher.id) {
        throw new ForbiddenError('Only the creator can update this assessment');
      }
    }
    
    const { questionIds, ...assessmentData } = data;
    let totalMarks = assessment.totalMarks;
    
    return prisma.$transaction(async (tx) => {
      if (questionIds) {
        totalMarks = questionIds.reduce((sum: number, q: any) => sum + q.marks, 0);
        await tx.assessmentQuestion.deleteMany({ where: { assessmentId: id } });
      }
      
      const teacher = await tx.teacher.findUnique({ where: { userId } });
      const teacherId = teacher ? teacher.id : assessment.teacherId;
      
      return tx.assessment.update({
        where: { id },
        data: {
          ...assessmentData,
          teacherId,
          ...(questionIds && { totalMarks, questions: { create: questionIds } })
        },
        include: { questions: true }
      });
    });
  }
  
  async delete(id: string, userId: string, role: string) {
    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment) throw new NotFoundError('Assessment not found');
    
    if (role !== 'ADMIN') {
      const teacher = await prisma.teacher.findUnique({ where: { userId } });
      if (!teacher || assessment.teacherId !== teacher.id) {
        throw new ForbiddenError('Only the creator or admin can delete this assessment');
      }
    }
    
    await prisma.assessment.delete({ where: { id } });
  }
  
  async startAttempt(assessmentId: string, userId: string) {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw new ForbiddenError('Student profile not found');

    const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
    if (!assessment) throw new NotFoundError('Assessment not found');
    if (!assessment.isPublished) throw new ForbiddenError('Assessment is not published');
    
    const now = new Date();
    if (assessment.availableFrom && now < new Date(assessment.availableFrom)) {
      throw new ForbiddenError('Assessment is not yet available');
    }
    if (assessment.availableTo && now > new Date(assessment.availableTo)) {
      throw new ForbiddenError('Assessment is no longer available');
    }
    
    if (assessment.maxAttempts) {
      const attemptsCount = await prisma.assessmentAttempt.count({
        where: { assessmentId, studentId: student.id }
      });
      if (attemptsCount >= assessment.maxAttempts) {
        throw new ForbiddenError('Maximum attempts exceeded');
      }
    }
    
    const existing = await prisma.assessmentAttempt.findFirst({
      where: { assessmentId, studentId: student.id, status: 'IN_PROGRESS' }
    });
    if (existing) return existing;
    
    return prisma.assessmentAttempt.create({
      data: {
        assessmentId,
        studentId: student.id,
        status: 'IN_PROGRESS'
      }
    });
  }
  
  async submitAttempt(assessmentId: string, userId: string, data: any) {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw new ForbiddenError('Student profile not found');

    const attempt = await prisma.assessmentAttempt.findFirst({
      where: { assessmentId, studentId: student.id, status: 'IN_PROGRESS' },
      include: {
        assessment: {
          include: {
            questions: {
              include: { question: true }
            }
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });
    
    if (!attempt) throw new NotFoundError('No active attempt found');
    const { answers } = data;
    const { assessment } = attempt;
    
    let score = 0;
    const studentAnswersData: any[] = [];
    
    for (const ans of answers) {
      const assessmentQuestion = assessment.questions.find(q => q.id === ans.assessmentQuestionId);
      if (!assessmentQuestion) continue;
      
      const isCorrect = assessmentQuestion.question.correctAnswer === ans.selectedAnswer;
      const marksAwarded = isCorrect ? assessmentQuestion.marks : 0;
      score += marksAwarded;
      
      studentAnswersData.push({
        attemptId: attempt.id,
        assessmentQuestionId: ans.assessmentQuestionId,
        selectedAnswer: ans.selectedAnswer,
        isCorrect,
        marksAwarded,
        timeSpent: 0
      });
    }
    
    const percentage = (score / assessment.totalMarks) * 100;
    
    const resultData = await prisma.$transaction(async (tx) => {
      await tx.studentAnswer.createMany({ data: studentAnswersData });
      
      const updatedAttempt = await tx.assessmentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date()
        }
      });
      
      const result = await tx.assessmentResult.create({
        data: {
          attemptId: attempt.id,
          studentId: student.id,
          assessmentId: assessment.id,
          obtainedMarks: score,
          totalMarks: assessment.totalMarks,
          percentage,
          correctAnswers: studentAnswersData.filter(a => a.isCorrect).length,
          incorrectAnswers: studentAnswersData.filter(a => !a.isCorrect).length,
          unanswered: assessment.questions.length - studentAnswersData.length
        }
      });
      
      const pr = await tx.performanceRecord.findFirst({
        where: { studentId: student.id, subjectId: assessment.subjectId }
      });
      
      if (pr) {
        await tx.performanceRecord.update({
          where: { id: pr.id },
          data: {
            totalAttempts: pr.totalAttempts + 1,
            calculatedAt: new Date()
          }
        });
      } else {
        await tx.performanceRecord.create({
          data: {
            studentId: student.id,
            subjectId: assessment.subjectId,
            averagePercentage: percentage,
            totalAttempts: 1,
            totalCorrect: studentAnswersData.filter(a => a.isCorrect).length,
            totalIncorrect: studentAnswersData.filter(a => !a.isCorrect).length,
            level: percentage >= 75 ? 'STRONG' : percentage < 50 ? 'WEAK' : 'NEEDS_PRACTICE'
          }
        });
      }
      
      return { attempt: updatedAttempt, result };
    });

    try {
      await analyticsService.calculatePerformance(student.id, assessment.subjectId);
      
      const autoGenerate = await prisma.systemConfig.findUnique({
        where: { key: 'RECOMMENDATION_AUTO_GENERATE' }
      });
      
      if (autoGenerate?.value === 'true') {
        await recommendationsService.generateRecommendations(student.id, assessment.subjectId);
      }
    } catch (err) {
      console.error('Error post-attempt calculations:', err);
    }

    return resultData;
  }
  
  async getAttempts(assessmentId: string, userId: string, role: string) {
    let where: any = { assessmentId };
    
    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId } });
      if (!student) throw new ForbiddenError('Student profile not found');
      where.studentId = student.id;
    }
    
    return prisma.assessmentAttempt.findMany({
      where,
      include: {
        student: { select: { user: { select: { firstName: true, lastName: true } } } },
        result: true
      },
      orderBy: { startedAt: 'desc' }
    });
  }
  
  async getResult(attemptId: string, userId: string, role: string) {
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: true,
        result: true,
        answers: {
          include: {
            assessmentQuestion: {
              include: { question: true }
            }
          }
        }
      }
    });
    
    if (!attempt) throw new NotFoundError('Attempt not found');
    
    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId } });
      if (!student || attempt.studentId !== student.id) {
        throw new ForbiddenError('Cannot view other student results');
      }
    }
    
    return attempt;
  }
}

export const assessmentService = new AssessmentService();

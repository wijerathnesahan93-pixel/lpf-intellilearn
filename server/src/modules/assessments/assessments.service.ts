import prisma from '../../config/database';
import { NotFoundError, ConflictError, ForbiddenError } from '../../utils/errors';
import { buildPaginationMeta } from '../../utils/pagination';

export class AssessmentService {
  async list(params: { page: number; limit: number; teacherId?: string; studentId?: string; role: string }) {
    const { page, limit, teacherId, studentId, role } = params;
    const skip = (page - 1) * limit;
    
    let where: any = {};
    
    if (role === 'TEACHER' && teacherId) {
      where.teacherId = teacherId;
    } else if (role === 'STUDENT' && studentId) {
      where.isPublished = true;
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
        include: { class: true }
      });
      // Allow if assessment has no specific class or matches enrolled class
      // To simplify for student view based on subjects enrolled:
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
    
    // For students, strip out correct answers
    if (role === 'STUDENT') {
      assessment.questions = assessment.questions.map(aq => {
        const q = aq.question;
        // Exclude correctAnswer and options.isCorrect
        const { correctAnswer, ...qWithoutAnswer } = q;
        const optionsWithoutCorrect = q.options.map(opt => {
          const { isCorrect, ...optWithoutCorrect } = opt;
          return optWithoutCorrect as any; // Cast since we removed field
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
  
  async create(data: any, teacherId: string) {
    const { questionIds, ...assessmentData } = data;
    
    // Calculate total marks
    const totalMarks = questionIds.reduce((sum: number, q: any) => sum + q.marks, 0);
    
    return prisma.assessment.create({
      data: {
        ...assessmentData,
        teacherId,
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
    
    if (role !== 'ADMIN' && assessment.teacherId !== userId) {
      throw new ForbiddenError('Only the creator can update this assessment');
    }
    
    const { questionIds, ...assessmentData } = data;
    
    let totalMarks = assessment.totalMarks;
    
    return prisma.$transaction(async (tx) => {
      if (questionIds) {
        totalMarks = questionIds.reduce((sum: number, q: any) => sum + q.marks, 0);
        await tx.assessmentQuestion.deleteMany({ where: { assessmentId: id } });
      }
      
      return tx.assessment.update({
        where: { id },
        data: {
          ...assessmentData,
          ...(questionIds && { totalMarks, questions: { create: questionIds } })
        },
        include: { questions: true }
      });
    });
  }
  
  async delete(id: string, userId: string, role: string) {
    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment) throw new NotFoundError('Assessment not found');
    
    if (role !== 'ADMIN' && assessment.teacherId !== userId) {
      throw new ForbiddenError('Only the creator or admin can delete this assessment');
    }
    
    await prisma.assessment.delete({ where: { id } });
  }
  
  async startAttempt(assessmentId: string, studentId: string) {
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
        where: { assessmentId, studentId }
      });
      if (attemptsCount >= assessment.maxAttempts) {
        throw new ForbiddenError('Maximum attempts exceeded');
      }
    }
    
    // Check for existing IN_PROGRESS attempt
    const existing = await prisma.assessmentAttempt.findFirst({
      where: { assessmentId, studentId, status: 'IN_PROGRESS' }
    });
    if (existing) return existing;
    
    return prisma.assessmentAttempt.create({
      data: {
        assessmentId,
        studentId,
        status: 'IN_PROGRESS'
      }
    });
  }
  
  async submitAttempt(assessmentId: string, studentId: string, data: any) {
    const attempt = await prisma.assessmentAttempt.findFirst({
      where: { assessmentId, studentId, status: 'IN_PROGRESS' },
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
        timeSpent: 0 // Optional tracking
      });
    }
    
    const percentage = (score / assessment.totalMarks) * 100;
    
    return prisma.$transaction(async (tx) => {
      // Save answers
      await tx.studentAnswer.createMany({ data: studentAnswersData });
      
      // Update attempt
      const updatedAttempt = await tx.assessmentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date()
        }
      });
      
      // Create result
      const result = await tx.assessmentResult.create({
        data: {
          attemptId: attempt.id,
          obtainedMarks: score,
          totalMarks: assessment.totalMarks,
          percentage,
          correctAnswers: studentAnswersData.filter(a => a.isCorrect).length,
          incorrectAnswers: studentAnswersData.filter(a => !a.isCorrect).length,
          unanswered: assessment.questions.length - studentAnswersData.length
        }
      });
      
      // Update performance record (simple implementation)
      const pr = await tx.performanceRecord.findFirst({
        where: { studentId, subjectId: assessment.subjectId }
      });
      
      if (pr) {
        // Just increment metrics for simplicity
        await tx.performanceRecord.update({
          where: { id: pr.id },
          data: {
            totalAttempts: pr.totalAttempts + 1,
            lastCalculated: new Date()
          }
        });
      } else {
        await tx.performanceRecord.create({
          data: {
            studentId,
            subjectId: assessment.subjectId,
            averagePercentage: percentage,
            totalAttempts: 1,
            totalCorrect: studentAnswersData.filter(a => a.isCorrect).length,
            totalIncorrect: studentAnswersData.filter(a => !a.isCorrect).length,
            level: 'BEGINNER'
          }
        });
      }
      
      return { attempt: updatedAttempt, result };
    });
  }
  
  async getAttempts(assessmentId: string, userId: string, role: string) {
    let where: any = { assessmentId };
    
    if (role === 'STUDENT') {
      where.studentId = userId;
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
    
    if (role === 'STUDENT' && attempt.studentId !== userId) {
      throw new ForbiddenError('Cannot view other student results');
    }
    
    return attempt;
  }
}

export const assessmentService = new AssessmentService();

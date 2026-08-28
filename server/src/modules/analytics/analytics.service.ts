import prisma from '../../config/database';

export const analyticsService = {
  getStudentPerformance: async (studentId: string) => {
    return prisma.performanceRecord.findMany({
      where: { studentId },
      include: {
        subject: true,
        topic: true
      }
    });
  },

  getSubjectAnalytics: async (subjectId: string, classId?: string) => {
    const where: any = { subjectId };
    if (classId) {
      where.student = { enrollments: { some: { classId } } };
    }
    
    const records = await prisma.performanceRecord.findMany({
      where,
      include: { student: true, topic: true }
    });

    const totalStudents = new Set(records.map(r => r.studentId)).size;
    
    return {
      totalStudents,
      records
    };
  },

  calculatePerformance: async (studentId: string, subjectId: string) => {
    // 1. Get all submitted attempts for this student and subject
    const attempts = await prisma.assessmentAttempt.findMany({
      where: {
        studentId,
        assessment: { subjectId },
        status: 'SUBMITTED'
      },
      include: {
        answers: {
          include: {
            assessmentQuestion: {
              include: { question: true }
            }
          }
        }
      }
    });

    // 2. Aggregate stats by topic
    const topicStats: {
      [topicId: string]: {
        totalAttempts: number;
        totalCorrect: number;
        totalIncorrect: number;
        obtainedMarks: number;
        totalMarks: number;
      }
    } = {};

    let overallObtained = 0;
    let overallTotal = 0;
    let overallCorrect = 0;
    let overallIncorrect = 0;
    const overallAttemptsCount = attempts.length;

    for (const attempt of attempts) {
      for (const answer of attempt.answers) {
        const question = answer.assessmentQuestion.question;
        const topicId = question.topicId;
        if (!topicId) continue;
        const marks = answer.assessmentQuestion.marks;
        const obtained = answer.marksAwarded;

        overallObtained += obtained;
        overallTotal += marks;
        if (answer.isCorrect) overallCorrect++;
        else overallIncorrect++;

        if (!topicStats[topicId]) {
          topicStats[topicId] = {
            totalAttempts: 0,
            totalCorrect: 0,
            totalIncorrect: 0,
            obtainedMarks: 0,
            totalMarks: 0
          };
        }

        topicStats[topicId].totalAttempts++;
        topicStats[topicId].obtainedMarks += obtained;
        topicStats[topicId].totalMarks += marks;
        if (answer.isCorrect) {
          topicStats[topicId].totalCorrect++;
        } else {
          topicStats[topicId].totalIncorrect++;
        }
      }
    }

    // 3. Upsert performance record for each topic
    for (const [topicId, stats] of Object.entries(topicStats)) {
      const avgPercentage = stats.totalMarks > 0 ? (stats.obtainedMarks / stats.totalMarks) * 100 : 0;
      let level: 'STRONG' | 'WEAK' | 'NEEDS_PRACTICE' = 'NEEDS_PRACTICE';
      if (avgPercentage >= 75) level = 'STRONG';
      else if (avgPercentage < 50) level = 'WEAK';

      // Find existing topic record
      const existing = await prisma.performanceRecord.findFirst({
        where: { studentId, subjectId, topicId }
      });

      if (existing) {
        await prisma.performanceRecord.update({
          where: { id: existing.id },
          data: {
            averagePercentage: avgPercentage,
            totalAttempts: stats.totalAttempts,
            totalCorrect: stats.totalCorrect,
            totalIncorrect: stats.totalIncorrect,
            level,
            calculatedAt: new Date()
          }
        });
      } else {
        await prisma.performanceRecord.create({
          data: {
            studentId,
            subjectId,
            topicId,
            averagePercentage: avgPercentage,
            totalAttempts: stats.totalAttempts,
            totalCorrect: stats.totalCorrect,
            totalIncorrect: stats.totalIncorrect,
            level,
            calculatedAt: new Date()
          }
        });
      }
    }

    // 4. Upsert overall subject performance (topicId: null)
    const overallPercentage = overallTotal > 0 ? (overallObtained / overallTotal) * 100 : 0;
    let overallLevel: 'STRONG' | 'WEAK' | 'NEEDS_PRACTICE' = 'NEEDS_PRACTICE';
    if (overallPercentage >= 75) overallLevel = 'STRONG';
    else if (overallPercentage < 50) overallLevel = 'WEAK';

    const existingOverall = await prisma.performanceRecord.findFirst({
      where: { studentId, subjectId, topicId: null }
    });

    if (existingOverall) {
      await prisma.performanceRecord.update({
        where: { id: existingOverall.id },
        data: {
          averagePercentage: overallPercentage,
          totalAttempts: overallAttemptsCount,
          totalCorrect: overallCorrect,
          totalIncorrect: overallIncorrect,
          level: overallLevel,
          calculatedAt: new Date()
        }
      });
    } else {
      await prisma.performanceRecord.create({
        data: {
          studentId,
          subjectId,
          topicId: null,
          averagePercentage: overallPercentage,
          totalAttempts: overallAttemptsCount,
          totalCorrect: overallCorrect,
          totalIncorrect: overallIncorrect,
          level: overallLevel,
          calculatedAt: new Date()
        }
      });
    }

    return { success: true };
  },

  getClassPerformance: async (classId: string) => {
    return prisma.performanceRecord.findMany({
      where: {
        student: { enrollments: { some: { classId } } }
      },
      include: { student: true, subject: true, topic: true }
    });
  },

  getWeakTopics: async (studentId: string) => {
    return prisma.performanceRecord.findMany({
      where: { studentId, level: 'WEAK' },
      include: { topic: true, subject: true }
    });
  },

  getStrongTopics: async (studentId: string) => {
    return prisma.performanceRecord.findMany({
      where: { studentId, level: 'STRONG' },
      include: { topic: true, subject: true }
    });
  }
};

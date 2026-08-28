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
    // Dummy calculation
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

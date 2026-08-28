import prisma from '../../config/database';

export class DashboardService {
  async getAdminDashboard() {
    const [totalStudents, totalTeachers, totalParents, totalSubjects, totalClasses, totalCourses, recentAssessments] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.parent.count(),
      prisma.subject.count(),
      prisma.class.count(),
      prisma.course.count(),
      prisma.assessment.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { subject: true } }),
    ]);
    return { totalStudents, totalTeachers, totalParents, totalSubjects, totalClasses, totalCourses, recentAssessments };
  }

  async getTeacherDashboard(userId: string) {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) throw new Error('Teacher not found');
    
    const [assignedSubjects, pendingSubmissions, upcomingAssessments, recentResults] = await Promise.all([
      prisma.teacherSubjectAssignment.findMany({
        where: { teacherId: teacher.id },
        include: { subject: true, class: true },
      }),
      prisma.assignmentSubmission.count({
        where: { assignment: { teacherId: teacher.id }, status: 'SUBMITTED' },
      }),
      prisma.assessment.findMany({
        where: { teacherId: teacher.id, isPublished: true, availableTo: { gte: new Date() } },
        take: 5, orderBy: { availableFrom: 'asc' },
        include: { subject: true },
      }),
      prisma.assessmentResult.findMany({
        where: { assessment: { teacherId: teacher.id } },
        take: 10, orderBy: { createdAt: 'desc' },
        include: { student: { include: { user: { select: { firstName: true, lastName: true } } } }, assessment: { select: { title: true } } },
      }),
    ]);
    return { assignedSubjects, pendingSubmissions, upcomingAssessments, recentResults };
  }

  async getStudentDashboard(userId: string) {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw new Error('Student not found');
    
    const [enrollments, upcomingAssignments, upcomingAssessments, recentResults, notifications, recommendations] = await Promise.all([
      prisma.enrollment.findMany({
        where: { studentId: student.id },
        include: { subject: true, class: true },
      }),
      prisma.assignment.findMany({
        where: {
          isPublished: true,
          dueDate: { gte: new Date() },
          class: { enrollments: { some: { studentId: student.id } } },
        },
        take: 5, orderBy: { dueDate: 'asc' },
        include: { subject: true },
      }),
      prisma.assessment.findMany({
        where: {
          isPublished: true,
          availableTo: { gte: new Date() },
          OR: [
            { class: { enrollments: { some: { studentId: student.id } } } },
            { classId: null, subject: { enrollments: { some: { studentId: student.id } } } },
          ],
        },
        take: 5, orderBy: { availableFrom: 'asc' },
        include: { subject: true },
      }),
      prisma.assessmentResult.findMany({
        where: { studentId: student.id },
        take: 5, orderBy: { createdAt: 'desc' },
        include: { assessment: { include: { subject: true } } },
      }),
      prisma.notification.findMany({
        where: { userId, isRead: false },
        take: 5, orderBy: { createdAt: 'desc' },
      }),
      prisma.recommendation.findMany({
        where: { studentId: student.id, isCompleted: false },
        take: 5,
        include: { topic: true, subject: true },
      }),
    ]);
    
    const performanceRecords = await prisma.performanceRecord.findMany({
      where: { studentId: student.id, topicId: { not: null } },
      include: { subject: true, topic: true },
      orderBy: { averagePercentage: 'asc' },
    });
    
    const weakTopics = performanceRecords.filter(p => p.level === 'WEAK');
    
    return { enrollments, upcomingAssignments, upcomingAssessments, recentResults, notifications, recommendations, performanceRecords, weakTopics };
  }

  async getParentDashboard(userId: string) {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: {
        children: {
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true } },
                enrollments: { include: { subject: true, class: true } },
                assessmentResults: {
                  take: 5, orderBy: { createdAt: 'desc' },
                  include: { assessment: { include: { subject: true } } },
                },
                performanceRecords: {
                  where: { topicId: { not: null } },
                  include: { subject: true, topic: true },
                },
              },
            },
          },
        },
      },
    });
    if (!parent) throw new Error('Parent not found');
    
    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      take: 5, orderBy: { createdAt: 'desc' },
    });
    
    return { children: parent.children, notifications };
  }
}

export const dashboardService = new DashboardService();

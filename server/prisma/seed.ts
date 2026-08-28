import { PrismaClient, UserRole, Gender, MaterialType, QuestionType, DifficultyLevel, AssessmentType, AttemptStatus, PerformanceLevel, RecommendationType, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');
  
  // Clean existing data (in reverse dependency order)
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.performanceRecord.deleteMany();
  await prisma.assessmentResult.deleteMany();
  await prisma.studentAnswer.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.assessmentQuestion.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.learningMaterial.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.teacherSubjectAssignment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.course.deleteMany();
  await prisma.class.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.parentChild.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.student.deleteMany();
  await prisma.systemConfig.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // ===== 1. SYSTEM CONFIG =====
  console.log('  📋 Creating system config...');
  await prisma.systemConfig.createMany({
    data: [
      { key: 'PERFORMANCE_STRONG_THRESHOLD', value: '75', description: 'Percentage threshold for Strong performance level' },
      { key: 'PERFORMANCE_PRACTICE_THRESHOLD', value: '50', description: 'Percentage threshold for Needs Practice level' },
      { key: 'PERFORMANCE_WEAK_THRESHOLD', value: '50', description: 'Percentage below which topic is considered Weak' },
      { key: 'DEFAULT_ASSESSMENT_MAX_ATTEMPTS', value: '3', description: 'Default maximum attempts for assessments' },
      { key: 'RECOMMENDATION_AUTO_GENERATE', value: 'true', description: 'Auto-generate recommendations on assessment completion' },
    ],
  });

  // ===== 2. ADMIN USER =====
  console.log('  👤 Creating admin...');
  await prisma.user.create({
    data: {
      email: 'admin@lpfacademy.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      status: 'APPROVED'
    },
  });

  // ===== 3. GRADES 1-13 =====
  console.log('  🎓 Creating Grades 1-13...');
  for (let i = 1; i <= 13; i++) {
    await prisma.grade.create({
      data: {
        number: i,
        name: `Grade ${i}`,
        isActive: true
      }
    });
  }

  // ===== 4. ACADEMIC YEAR =====
  console.log('  📅 Creating academic year...');
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2025/2026',
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-12-15'),
      isCurrent: true,
    },
  });

  // ===== 5. COURSE =====
  console.log('  📚 Creating default courses...');
  const course = await prisma.course.create({
    data: { name: 'LPF Curriculum', code: 'LPF-CURR', description: 'General Curriculum for LPF Academy' },
  });

  // ===== 6. SUBJECTS =====
  console.log('  📖 Creating default subjects...');
  const subjectsData = [
    { name: 'Mathematics', code: 'MATH', description: 'General Mathematics' },
    { name: 'Science', code: 'SCI', description: 'General Science' },
    { name: 'English', code: 'ENG', description: 'English Language & Literature' },
    { name: 'ICT', code: 'ICT', description: 'Information & Communication Technology' },
    { name: 'History', code: 'HIS', description: 'History Studies' },
  ];

  for (const sd of subjectsData) {
    await prisma.subject.create({
      data: {
        name: sd.name,
        code: sd.code,
        courseId: course.id,
        description: sd.description
      }
    });
  }

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

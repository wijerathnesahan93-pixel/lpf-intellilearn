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
  const admin = await prisma.user.create({
    data: {
      email: 'admin@lpfacademy.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
    },
  });

  // ===== 3. TEACHERS =====
  console.log('  👨🏫 Creating teachers...');
  const teacherData = [
    { email: 't.silva@lpfacademy.com', firstName: 'Tharuka', lastName: 'Silva', employeeId: 'TCH-001', qualification: 'B.Sc. Mathematics', specialization: 'Mathematics', phone: '0771234567' },
    { email: 't.fernando@lpfacademy.com', firstName: 'Nimali', lastName: 'Fernando', employeeId: 'TCH-002', qualification: 'B.Sc. Biology', specialization: 'Science', phone: '0772345678' },
    { email: 't.perera@lpfacademy.com', firstName: 'Kamal', lastName: 'Perera', employeeId: 'TCH-003', qualification: 'B.A. English', specialization: 'English', phone: '0773456789' },
    { email: 't.jayawardena@lpfacademy.com', firstName: 'Dilshan', lastName: 'Jayawardena', employeeId: 'TCH-004', qualification: 'B.Sc. IT', specialization: 'ICT', phone: '0774567890' },
    { email: 't.bandara@lpfacademy.com', firstName: 'Samantha', lastName: 'Bandara', employeeId: 'TCH-005', qualification: 'B.A. History', specialization: 'History', phone: '0775678901' },
  ];

  const teachers: any[] = [];
  for (const td of teacherData) {
    const user = await prisma.user.create({
      data: {
        email: td.email,
        passwordHash,
        firstName: td.firstName,
        lastName: td.lastName,
        role: UserRole.TEACHER,
        teacher: {
          create: {
            employeeId: td.employeeId,
            qualification: td.qualification,
            specialization: td.specialization,
            phone: td.phone,
          },
        },
      },
      include: { teacher: true },
    });
    teachers.push(user.teacher!);
  }

  // ===== 4. STUDENTS =====
  console.log('  👨🎓 Creating students...');
  const studentData = [
    { email: 's.perera@lpfacademy.com', firstName: 'Sahan', lastName: 'Perera', admissionNumber: 'STU-2025-001', gender: Gender.MALE, dateOfBirth: new Date('2010-03-15') },
    { email: 's.de.silva@lpfacademy.com', firstName: 'Nethmi', lastName: 'De Silva', admissionNumber: 'STU-2025-002', gender: Gender.FEMALE, dateOfBirth: new Date('2010-05-22') },
    { email: 's.rajapaksha@lpfacademy.com', firstName: 'Kavinda', lastName: 'Rajapaksha', admissionNumber: 'STU-2025-003', gender: Gender.MALE, dateOfBirth: new Date('2010-01-08') },
    { email: 's.wickramasinghe@lpfacademy.com', firstName: 'Ishara', lastName: 'Wickramasinghe', admissionNumber: 'STU-2025-004', gender: Gender.FEMALE, dateOfBirth: new Date('2010-07-30') },
    { email: 's.jayasuriya@lpfacademy.com', firstName: 'Dineth', lastName: 'Jayasuriya', admissionNumber: 'STU-2025-005', gender: Gender.MALE, dateOfBirth: new Date('2010-11-12') },
    { email: 's.kumari@lpfacademy.com', firstName: 'Rashmi', lastName: 'Kumari', admissionNumber: 'STU-2025-006', gender: Gender.FEMALE, dateOfBirth: new Date('2010-04-25') },
    { email: 's.dissanayake@lpfacademy.com', firstName: 'Ashan', lastName: 'Dissanayake', admissionNumber: 'STU-2025-007', gender: Gender.MALE, dateOfBirth: new Date('2010-09-18') },
    { email: 's.gunasekara@lpfacademy.com', firstName: 'Hasini', lastName: 'Gunasekara', admissionNumber: 'STU-2025-008', gender: Gender.FEMALE, dateOfBirth: new Date('2010-02-14') },
    { email: 's.herath@lpfacademy.com', firstName: 'Ravindu', lastName: 'Herath', admissionNumber: 'STU-2025-009', gender: Gender.MALE, dateOfBirth: new Date('2010-06-07') },
    { email: 's.mendis@lpfacademy.com', firstName: 'Saduni', lastName: 'Mendis', admissionNumber: 'STU-2025-010', gender: Gender.FEMALE, dateOfBirth: new Date('2010-12-03') },
    { email: 's.weerasinghe@lpfacademy.com', firstName: 'Lakshan', lastName: 'Weerasinghe', admissionNumber: 'STU-2025-011', gender: Gender.MALE, dateOfBirth: new Date('2010-08-20') },
    { email: 's.gamage@lpfacademy.com', firstName: 'Minoli', lastName: 'Gamage', admissionNumber: 'STU-2025-012', gender: Gender.FEMALE, dateOfBirth: new Date('2010-10-16') },
    { email: 's.rathnayake@lpfacademy.com', firstName: 'Chamara', lastName: 'Rathnayake', admissionNumber: 'STU-2025-013', gender: Gender.MALE, dateOfBirth: new Date('2010-01-29') },
    { email: 's.samaraweera@lpfacademy.com', firstName: 'Dilini', lastName: 'Samaraweera', admissionNumber: 'STU-2025-014', gender: Gender.FEMALE, dateOfBirth: new Date('2010-05-11') },
    { email: 's.pathirana@lpfacademy.com', firstName: 'Nuwan', lastName: 'Pathirana', admissionNumber: 'STU-2025-015', gender: Gender.MALE, dateOfBirth: new Date('2010-07-04') },
  ];

  const students: any[] = [];
  for (const sd of studentData) {
    const user = await prisma.user.create({
      data: {
        email: sd.email,
        passwordHash,
        firstName: sd.firstName,
        lastName: sd.lastName,
        role: UserRole.STUDENT,
        student: {
          create: {
            admissionNumber: sd.admissionNumber,
            gender: sd.gender,
            dateOfBirth: sd.dateOfBirth,
          },
        },
      },
      include: { student: true },
    });
    students.push(user.student!);
  }

  // ===== 5. PARENTS =====
  console.log('  👪 Creating parents...');
  const parentData = [
    { email: 'p.perera@lpfacademy.com', firstName: 'Mahinda', lastName: 'Perera', phone: '0711111111', occupation: 'Engineer', childIndices: [0] },
    { email: 'p.desilva@lpfacademy.com', firstName: 'Sunethra', lastName: 'De Silva', phone: '0712222222', occupation: 'Doctor', childIndices: [1] },
    { email: 'p.rajapaksha@lpfacademy.com', firstName: 'Ranjith', lastName: 'Rajapaksha', phone: '0713333333', occupation: 'Businessman', childIndices: [2] },
    { email: 'p.wickramasinghe@lpfacademy.com', firstName: 'Kumari', lastName: 'Wickramasinghe', phone: '0714444444', occupation: 'Teacher', childIndices: [3, 4] },
    { email: 'p.kumari@lpfacademy.com', firstName: 'Anoma', lastName: 'Kumari', phone: '0715555555', occupation: 'Accountant', childIndices: [5, 6] },
    { email: 'p.gunasekara@lpfacademy.com', firstName: 'Pradeep', lastName: 'Gunasekara', phone: '0716666666', occupation: 'Lawyer', childIndices: [7] },
    { email: 'p.herath@lpfacademy.com', firstName: 'Lalith', lastName: 'Herath', phone: '0717777777', occupation: 'Manager', childIndices: [8, 9] },
    { email: 'p.gamage@lpfacademy.com', firstName: 'Chandani', lastName: 'Gamage', phone: '0718888888', occupation: 'Nurse', childIndices: [10, 11] },
  ];

  for (const pd of parentData) {
    await prisma.user.create({
      data: {
        email: pd.email,
        passwordHash,
        firstName: pd.firstName,
        lastName: pd.lastName,
        role: UserRole.PARENT,
        parent: {
          create: {
            phone: pd.phone,
            occupation: pd.occupation,
            children: {
              create: pd.childIndices.map(idx => ({
                studentId: students[idx].id,
                relationship: 'Parent',
              })),
            },
          },
        },
      },
    });
  }

  // ===== 6. ACADEMIC YEAR =====
  console.log('  📅 Creating academic year...');
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2025/2026',
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-12-15'),
      isCurrent: true,
    },
  });

  // ===== 7. CLASSES =====
  console.log('  🏫 Creating classes...');
  const classA = await prisma.class.create({
    data: { name: 'Grade 10 - A', academicYearId: academicYear.id, grade: 10, section: 'A', capacity: 40 },
  });
  const classB = await prisma.class.create({
    data: { name: 'Grade 10 - B', academicYearId: academicYear.id, grade: 10, section: 'B', capacity: 40 },
  });

  // ===== 8. COURSE =====
  console.log('  📚 Creating course...');
  const course = await prisma.course.create({
    data: { name: 'O/L Curriculum', code: 'OL-2025', description: 'Ordinary Level curriculum for Grade 10' },
  });

  // ===== 9. SUBJECTS =====
  console.log('  📖 Creating subjects...');
  const subjectsData = [
    { name: 'Mathematics', code: 'MATH-10', description: 'Grade 10 Mathematics' },
    { name: 'Science', code: 'SCI-10', description: 'Grade 10 Science' },
    { name: 'English', code: 'ENG-10', description: 'Grade 10 English Language' },
    { name: 'ICT', code: 'ICT-10', description: 'Grade 10 Information & Communication Technology' },
    { name: 'History', code: 'HIS-10', description: 'Grade 10 History' },
  ];

  const subjects: any[] = [];
  for (const sd of subjectsData) {
    const subject = await prisma.subject.create({
      data: { ...sd, courseId: course.id },
    });
    subjects.push(subject);
  }

  // ===== 10. TOPICS =====
  console.log('  📝 Creating topics...');
  const topicsMap: Record<string, any[]> = {};
  
  const topicsData: Record<string, string[]> = {
    'Mathematics': ['Algebra', 'Functions', 'Trigonometry', 'Differentiation', 'Integration', 'Statistics'],
    'Science': ['Mechanics', 'Electricity', 'Chemical Reactions', 'Organic Chemistry', 'Biology - Cells', 'Ecology'],
    'English': ['Grammar', 'Reading Comprehension', 'Essay Writing', 'Literature', 'Vocabulary'],
    'ICT': ['Computer Systems', 'Programming Concepts', 'Databases', 'Networking', 'Web Development'],
    'History': ['Ancient Civilizations', 'Medieval Period', 'Colonial Era', 'Independence Movement', 'Modern History'],
  };

  for (const subject of subjects) {
    const topicNames = topicsData[subject.name] || [];
    topicsMap[subject.id] = [];
    for (let i = 0; i < topicNames.length; i++) {
      const topic = await prisma.topic.create({
        data: {
          name: topicNames[i],
          subjectId: subject.id,
          orderIndex: i + 1,
          description: `${topicNames[i]} - ${subject.name}`,
        },
      });
      topicsMap[subject.id].push(topic);
    }
  }

  // ===== 11. TEACHER ASSIGNMENTS =====
  console.log('  👨🏫 Assigning teachers to subjects...');
  // Each teacher teaches their specialization subject in both classes
  for (let i = 0; i < teachers.length; i++) {
    await prisma.teacherSubjectAssignment.create({
      data: { teacherId: teachers[i].id, subjectId: subjects[i].id, classId: classA.id },
    });
    await prisma.teacherSubjectAssignment.create({
      data: { teacherId: teachers[i].id, subjectId: subjects[i].id, classId: classB.id },
    });
  }

  // ===== 12. ENROLLMENTS =====
  console.log('  📋 Enrolling students...');
  // First 8 students in Class A, rest in Class B. All enrolled in all 5 subjects.
  for (let i = 0; i < students.length; i++) {
    const cls = i < 8 ? classA : classB;
    for (const subject of subjects) {
      await prisma.enrollment.create({
        data: { studentId: students[i].id, classId: cls.id, subjectId: subject.id },
      });
    }
  }

  // ===== 13. LESSONS =====
  console.log('  📖 Creating lessons...');
  for (let si = 0; si < subjects.length; si++) {
    const subjectTopics = topicsMap[subjects[si].id];
    for (let ti = 0; ti < Math.min(3, subjectTopics.length); ti++) {
      await prisma.lesson.create({
        data: {
          title: `Introduction to ${subjectTopics[ti].name}`,
          content: `<h2>${subjectTopics[ti].name}</h2><p>This lesson introduces the fundamental concepts of ${subjectTopics[ti].name} in ${subjects[si].name}. Students will learn the key principles, definitions, and foundational knowledge required to understand this topic.</p><h3>Learning Objectives</h3><ul><li>Understand the basic concepts of ${subjectTopics[ti].name}</li><li>Apply key formulas and methods</li><li>Solve practice problems</li></ul><h3>Key Concepts</h3><p>This topic is essential for building a strong foundation in ${subjects[si].name}. Pay close attention to the examples and practice exercises provided.</p>`,
          subjectId: subjects[si].id,
          topicId: subjectTopics[ti].id,
          teacherId: teachers[si].id,
          orderIndex: ti + 1,
          isPublished: true,
        },
      });
    }
  }

  // ===== 14. LEARNING MATERIALS =====
  console.log('  📁 Creating learning materials...');
  for (let si = 0; si < subjects.length; si++) {
    const subjectTopics = topicsMap[subjects[si].id];
    if (subjectTopics.length > 0) {
      await prisma.learningMaterial.create({
        data: {
          title: `${subjectTopics[0].name} Study Guide`,
          description: `Comprehensive study guide for ${subjectTopics[0].name}`,
          type: MaterialType.PDF,
          fileUrl: '/uploads/sample-study-guide.pdf',
          fileName: `${subjects[si].name.toLowerCase()}-${subjectTopics[0].name.toLowerCase().replace(/ /g, '-')}-guide.pdf`,
          fileSize: 1024000,
          subjectId: subjects[si].id,
          topicId: subjectTopics[0].id,
          teacherId: teachers[si].id,
          isPublished: true,
        },
      });
    }
    if (subjectTopics.length > 1) {
      await prisma.learningMaterial.create({
        data: {
          title: `${subjectTopics[1].name} Video Tutorial`,
          description: `Video explanation of ${subjectTopics[1].name} concepts`,
          type: MaterialType.VIDEO,
          fileUrl: '/uploads/sample-video.mp4',
          fileName: `${subjects[si].name.toLowerCase()}-${subjectTopics[1].name.toLowerCase().replace(/ /g, '-')}-tutorial.mp4`,
          fileSize: 50000000,
          subjectId: subjects[si].id,
          topicId: subjectTopics[1].id,
          teacherId: teachers[si].id,
          isPublished: true,
        },
      });
    }
  }

  // ===== 15. ASSIGNMENTS =====
  console.log('  📄 Creating assignments...');
  const assignments: any[] = [];
  for (let si = 0; si < subjects.length; si++) {
    const assignment = await prisma.assignment.create({
      data: {
        title: `${subjects[si].name} Assignment 1`,
        instructions: `Complete all questions related to ${subjects[si].name}. Show all working where applicable. Submit before the deadline.`,
        subjectId: subjects[si].id,
        classId: classA.id,
        teacherId: teachers[si].id,
        totalMarks: 50,
        dueDate: new Date('2025-09-30'),
        isPublished: true,
      },
    });
    assignments.push(assignment);
  }

  // ===== 16. ASSIGNMENT SUBMISSIONS (for first few students) =====
  console.log('  📨 Creating assignment submissions...');
  for (let i = 0; i < 5; i++) {
    await prisma.assignmentSubmission.create({
      data: {
        assignmentId: assignments[0].id,
        studentId: students[i].id,
        content: 'Student assignment submission content here.',
        status: i < 3 ? 'REVIEWED' : 'SUBMITTED',
        marks: i < 3 ? [42, 35, 38][i] : null,
        feedback: i < 3 ? 'Good work! Pay attention to the details in question 3.' : null,
        submittedAt: new Date('2025-09-25'),
        reviewedAt: i < 3 ? new Date('2025-09-28') : null,
      },
    });
  }

  // ===== 17. QUESTIONS =====
  console.log('  ❓ Creating questions...');
  // Create questions for Mathematics (subject index 0)
  const mathTopics = topicsMap[subjects[0].id];
  const allQuestions: any[] = [];
  
  // Algebra questions
  const algebraQuestions = [
    { text: 'What is the value of x in the equation 2x + 5 = 15?', correct: 'A', options: [{label: 'A', text: '5', isCorrect: true}, {label: 'B', text: '10', isCorrect: false}, {label: 'C', text: '7.5', isCorrect: false}, {label: 'D', text: '3', isCorrect: false}], difficulty: DifficultyLevel.EASY },
    { text: 'Simplify: 3(x + 4) - 2(x - 1)', correct: 'B', options: [{label: 'A', text: 'x + 10', isCorrect: false}, {label: 'B', text: 'x + 14', isCorrect: true}, {label: 'C', text: '5x + 14', isCorrect: false}, {label: 'D', text: 'x + 12', isCorrect: false}], difficulty: DifficultyLevel.EASY },
    { text: 'Solve for y: 4y - 8 = 2y + 6', correct: 'C', options: [{label: 'A', text: '2', isCorrect: false}, {label: 'B', text: '5', isCorrect: false}, {label: 'C', text: '7', isCorrect: true}, {label: 'D', text: '14', isCorrect: false}], difficulty: DifficultyLevel.MEDIUM },
    { text: 'Which of the following is a quadratic equation?', correct: 'B', options: [{label: 'A', text: '3x + 5 = 0', isCorrect: false}, {label: 'B', text: 'x² + 3x + 2 = 0', isCorrect: true}, {label: 'C', text: '2/x = 4', isCorrect: false}, {label: 'D', text: 'x³ = 27', isCorrect: false}], difficulty: DifficultyLevel.MEDIUM },
    { text: 'Find the roots of x² - 5x + 6 = 0', correct: 'A', options: [{label: 'A', text: 'x = 2 and x = 3', isCorrect: true}, {label: 'B', text: 'x = -2 and x = -3', isCorrect: false}, {label: 'C', text: 'x = 1 and x = 6', isCorrect: false}, {label: 'D', text: 'x = -1 and x = -6', isCorrect: false}], difficulty: DifficultyLevel.HARD },
  ];

  for (const q of algebraQuestions) {
    const question = await prisma.question.create({
      data: {
        text: q.text,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: q.difficulty,
        marks: q.difficulty === DifficultyLevel.EASY ? 2 : q.difficulty === DifficultyLevel.MEDIUM ? 3 : 5,
        correctAnswer: q.correct,
        explanation: `The correct answer is ${q.correct}.`,
        subjectId: subjects[0].id,
        topicId: mathTopics[0].id, // Algebra
        teacherId: teachers[0].id,
        options: { create: q.options },
      },
    });
    allQuestions.push(question);
  }

  // Functions questions
  const functionsQuestions = [
    { text: 'If f(x) = 2x + 3, what is f(4)?', correct: 'C', options: [{label: 'A', text: '8', isCorrect: false}, {label: 'B', text: '10', isCorrect: false}, {label: 'C', text: '11', isCorrect: true}, {label: 'D', text: '14', isCorrect: false}], difficulty: DifficultyLevel.EASY },
    { text: 'What is the domain of f(x) = 1/(x-3)?', correct: 'B', options: [{label: 'A', text: 'All real numbers', isCorrect: false}, {label: 'B', text: 'All real numbers except 3', isCorrect: true}, {label: 'C', text: 'x > 3', isCorrect: false}, {label: 'D', text: 'x < 3', isCorrect: false}], difficulty: DifficultyLevel.MEDIUM },
    { text: 'If f(x) = x² and g(x) = x + 1, what is (f∘g)(2)?', correct: 'D', options: [{label: 'A', text: '5', isCorrect: false}, {label: 'B', text: '6', isCorrect: false}, {label: 'C', text: '8', isCorrect: false}, {label: 'D', text: '9', isCorrect: true}], difficulty: DifficultyLevel.HARD },
    { text: 'What is the range of f(x) = x²?', correct: 'A', options: [{label: 'A', text: 'y ≥ 0', isCorrect: true}, {label: 'B', text: 'All real numbers', isCorrect: false}, {label: 'C', text: 'y > 0', isCorrect: false}, {label: 'D', text: 'y ≤ 0', isCorrect: false}], difficulty: DifficultyLevel.MEDIUM },
    { text: 'Which function is the inverse of f(x) = 2x + 1?', correct: 'B', options: [{label: 'A', text: 'f⁻¹(x) = x/2 + 1', isCorrect: false}, {label: 'B', text: 'f⁻¹(x) = (x-1)/2', isCorrect: true}, {label: 'C', text: 'f⁻¹(x) = 2x - 1', isCorrect: false}, {label: 'D', text: 'f⁻¹(x) = 1/(2x+1)', isCorrect: false}], difficulty: DifficultyLevel.HARD },
  ];

  for (const q of functionsQuestions) {
    const question = await prisma.question.create({
      data: {
        text: q.text,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: q.difficulty,
        marks: q.difficulty === DifficultyLevel.EASY ? 2 : q.difficulty === DifficultyLevel.MEDIUM ? 3 : 5,
        correctAnswer: q.correct,
        explanation: `The correct answer is ${q.correct}.`,
        subjectId: subjects[0].id,
        topicId: mathTopics[1].id, // Functions
        teacherId: teachers[0].id,
        options: { create: q.options },
      },
    });
    allQuestions.push(question);
  }

  // Trigonometry questions
  const trigQuestions = [
    { text: 'What is sin(90°)?', correct: 'A', options: [{label: 'A', text: '1', isCorrect: true}, {label: 'B', text: '0', isCorrect: false}, {label: 'C', text: '-1', isCorrect: false}, {label: 'D', text: '0.5', isCorrect: false}], difficulty: DifficultyLevel.EASY },
    { text: 'What is tan(45°)?', correct: 'C', options: [{label: 'A', text: '0', isCorrect: false}, {label: 'B', text: '0.5', isCorrect: false}, {label: 'C', text: '1', isCorrect: true}, {label: 'D', text: '√2', isCorrect: false}], difficulty: DifficultyLevel.EASY },
    { text: 'In a right triangle, if the opposite side is 3 and the hypotenuse is 5, what is sin(θ)?', correct: 'B', options: [{label: 'A', text: '4/5', isCorrect: false}, {label: 'B', text: '3/5', isCorrect: true}, {label: 'C', text: '3/4', isCorrect: false}, {label: 'D', text: '5/3', isCorrect: false}], difficulty: DifficultyLevel.MEDIUM },
    { text: 'cos²(θ) + sin²(θ) = ?', correct: 'A', options: [{label: 'A', text: '1', isCorrect: true}, {label: 'B', text: '0', isCorrect: false}, {label: 'C', text: '2', isCorrect: false}, {label: 'D', text: 'tan(θ)', isCorrect: false}], difficulty: DifficultyLevel.EASY },
    { text: 'What is cos(60°)?', correct: 'D', options: [{label: 'A', text: '1', isCorrect: false}, {label: 'B', text: '√3/2', isCorrect: false}, {label: 'C', text: '√2/2', isCorrect: false}, {label: 'D', text: '1/2', isCorrect: true}], difficulty: DifficultyLevel.MEDIUM },
  ];

  for (const q of trigQuestions) {
    const question = await prisma.question.create({
      data: {
        text: q.text,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: q.difficulty,
        marks: q.difficulty === DifficultyLevel.EASY ? 2 : q.difficulty === DifficultyLevel.MEDIUM ? 3 : 5,
        correctAnswer: q.correct,
        explanation: `The correct answer is ${q.correct}.`,
        subjectId: subjects[0].id,
        topicId: mathTopics[2].id, // Trigonometry
        teacherId: teachers[0].id,
        options: { create: q.options },
      },
    });
    allQuestions.push(question);
  }

  // Add True/False questions for Differentiation
  const diffTFQuestions = [
    { text: 'The derivative of a constant is always zero.', correct: 'TRUE', isTrue: true, difficulty: DifficultyLevel.EASY },
    { text: 'The derivative of x² is 2x.', correct: 'TRUE', isTrue: true, difficulty: DifficultyLevel.EASY },
    { text: 'If f\'(x) = 0, then x is always a maximum point.', correct: 'FALSE', isTrue: false, difficulty: DifficultyLevel.MEDIUM },
    { text: 'The chain rule is used to differentiate composite functions.', correct: 'TRUE', isTrue: true, difficulty: DifficultyLevel.MEDIUM },
    { text: 'The derivative of sin(x) is -cos(x).', correct: 'FALSE', isTrue: false, difficulty: DifficultyLevel.HARD },
  ];

  for (const q of diffTFQuestions) {
    const question = await prisma.question.create({
      data: {
        text: q.text,
        type: QuestionType.TRUE_FALSE,
        difficulty: q.difficulty,
        marks: 2,
        correctAnswer: q.correct,
        explanation: `The statement is ${q.correct}.`,
        subjectId: subjects[0].id,
        topicId: mathTopics[3].id, // Differentiation
        teacherId: teachers[0].id,
        options: {
          create: [
            { label: 'TRUE', text: 'True', isCorrect: q.isTrue },
            { label: 'FALSE', text: 'False', isCorrect: !q.isTrue },
          ],
        },
      },
    });
    allQuestions.push(question);
  }

  // Also add some Science questions
  const scienceTopics = topicsMap[subjects[1].id];
  const scienceQuestions = [
    { text: 'What is Newton\'s First Law of Motion about?', correct: 'A', options: [{label: 'A', text: 'Inertia', isCorrect: true}, {label: 'B', text: 'Acceleration', isCorrect: false}, {label: 'C', text: 'Reaction', isCorrect: false}, {label: 'D', text: 'Gravity', isCorrect: false}], topic: 0, difficulty: DifficultyLevel.EASY },
    { text: 'What is the SI unit of electric current?', correct: 'B', options: [{label: 'A', text: 'Volt', isCorrect: false}, {label: 'B', text: 'Ampere', isCorrect: true}, {label: 'C', text: 'Watt', isCorrect: false}, {label: 'D', text: 'Ohm', isCorrect: false}], topic: 1, difficulty: DifficultyLevel.EASY },
    { text: 'Which gas is produced when zinc reacts with hydrochloric acid?', correct: 'C', options: [{label: 'A', text: 'Oxygen', isCorrect: false}, {label: 'B', text: 'Chlorine', isCorrect: false}, {label: 'C', text: 'Hydrogen', isCorrect: true}, {label: 'D', text: 'Nitrogen', isCorrect: false}], topic: 2, difficulty: DifficultyLevel.MEDIUM },
    { text: 'What is the powerhouse of the cell?', correct: 'D', options: [{label: 'A', text: 'Nucleus', isCorrect: false}, {label: 'B', text: 'Ribosome', isCorrect: false}, {label: 'C', text: 'Endoplasmic Reticulum', isCorrect: false}, {label: 'D', text: 'Mitochondria', isCorrect: true}], topic: 4, difficulty: DifficultyLevel.EASY },
    { text: 'Which is the correct formula for Ohm\'s Law?', correct: 'A', options: [{label: 'A', text: 'V = IR', isCorrect: true}, {label: 'B', text: 'V = I/R', isCorrect: false}, {label: 'C', text: 'I = VR', isCorrect: false}, {label: 'D', text: 'R = VI', isCorrect: false}], topic: 1, difficulty: DifficultyLevel.MEDIUM },
  ];

  const sciQuestionsCreated: any[] = [];
  for (const q of scienceQuestions) {
    const question = await prisma.question.create({
      data: {
        text: q.text,
        type: QuestionType.MULTIPLE_CHOICE,
        difficulty: q.difficulty,
        marks: q.difficulty === DifficultyLevel.EASY ? 2 : 3,
        correctAnswer: q.correct,
        subjectId: subjects[1].id,
        topicId: scienceTopics[q.topic].id,
        teacherId: teachers[1].id,
        options: { create: q.options },
      },
    });
    sciQuestionsCreated.push(question);
  }

  // ===== 18. ASSESSMENTS =====
  console.log('  📝 Creating assessments...');
  // Math Quiz 1 (Algebra + Functions)
  const mathQuiz1 = await prisma.assessment.create({
    data: {
      title: 'Mathematics Quiz 1 - Algebra & Functions',
      instructions: 'Answer all questions. Each question carries the marks indicated. You have 30 minutes to complete this quiz.',
      type: AssessmentType.QUIZ,
      subjectId: subjects[0].id,
      teacherId: teachers[0].id,
      classId: classA.id,
      totalMarks: 25,
      duration: 30,
      maxAttempts: 2,
      availableFrom: new Date('2025-08-01'),
      availableTo: new Date('2025-12-31'),
      isPublished: true,
    },
  });

  // Add first 5 algebra + first 3 functions questions
  const quiz1Questions = [...allQuestions.slice(0, 5), ...allQuestions.slice(5, 8)];
  for (let i = 0; i < quiz1Questions.length; i++) {
    await prisma.assessmentQuestion.create({
      data: {
        assessmentId: mathQuiz1.id,
        questionId: quiz1Questions[i].id,
        orderIndex: i + 1,
        marks: quiz1Questions[i].marks || 3,
      },
    });
  }

  // Math Practice Test (Trigonometry)
  const mathPractice = await prisma.assessment.create({
    data: {
      title: 'Mathematics Practice Test - Trigonometry',
      instructions: 'Practice test for trigonometry. You can attempt this multiple times.',
      type: AssessmentType.PRACTICE_TEST,
      subjectId: subjects[0].id,
      teacherId: teachers[0].id,
      classId: classA.id,
      totalMarks: 15,
      duration: 20,
      maxAttempts: 5,
      availableFrom: new Date('2025-08-01'),
      availableTo: new Date('2025-12-31'),
      isPublished: true,
    },
  });

  const trigQuestionsCreated = allQuestions.slice(10, 15);
  for (let i = 0; i < trigQuestionsCreated.length; i++) {
    await prisma.assessmentQuestion.create({
      data: {
        assessmentId: mathPractice.id,
        questionId: trigQuestionsCreated[i].id,
        orderIndex: i + 1,
        marks: trigQuestionsCreated[i].marks || 3,
      },
    });
  }

  // Science Quiz
  const scienceQuiz = await prisma.assessment.create({
    data: {
      title: 'Science Quiz 1 - General',
      instructions: 'Answer all questions. Select the best answer for each question.',
      type: AssessmentType.QUIZ,
      subjectId: subjects[1].id,
      teacherId: teachers[1].id,
      classId: classA.id,
      totalMarks: 12,
      duration: 15,
      maxAttempts: 1,
      availableFrom: new Date('2025-08-01'),
      availableTo: new Date('2025-12-31'),
      isPublished: true,
    },
  });

  for (let i = 0; i < sciQuestionsCreated.length; i++) {
    await prisma.assessmentQuestion.create({
      data: {
        assessmentId: scienceQuiz.id,
        questionId: sciQuestionsCreated[i].id,
        orderIndex: i + 1,
        marks: sciQuestionsCreated[i].marks || 2,
      },
    });
  }

  // ===== 19. ASSESSMENT ATTEMPTS & RESULTS =====
  console.log('  ✅ Creating assessment attempts and results...');
  // Simulate attempts for the first 5 students on mathQuiz1
  const quiz1AQs = await prisma.assessmentQuestion.findMany({
    where: { assessmentId: mathQuiz1.id },
    include: { question: { include: { options: true } } },
    orderBy: { orderIndex: 'asc' },
  });

  // Student performance patterns (how many they get right out of 8)
  const performancePatterns = [
    [true, true, true, true, true, true, true, false],   // Student 0: 7/8 high performer
    [true, true, true, false, false, false, false, false], // Student 1: 3/8 weak (especially functions)
    [true, true, true, true, false, true, true, false],   // Student 2: 6/8 good
    [true, false, true, false, true, false, true, false],  // Student 3: 4/8 mixed
    [true, true, false, true, true, true, false, true],    // Student 4: 6/8 good
  ];

  for (let si = 0; si < 5; si++) {
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        assessmentId: mathQuiz1.id,
        studentId: students[si].id,
        attemptNumber: 1,
        startedAt: new Date('2025-09-01T09:00:00'),
        submittedAt: new Date('2025-09-01T09:25:00'),
        status: AttemptStatus.SUBMITTED,
      },
    });

    let totalObtained = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    for (let qi = 0; qi < quiz1AQs.length; qi++) {
      const aq = quiz1AQs[qi];
      const isCorrect = performancePatterns[si][qi];
      const correctOption = aq.question.options.find(o => o.isCorrect);
      const wrongOption = aq.question.options.find(o => !o.isCorrect);
      const selectedAnswer = isCorrect ? (correctOption?.label || 'A') : (wrongOption?.label || 'B');
      const marksAwarded = isCorrect ? aq.marks : 0;

      await prisma.studentAnswer.create({
        data: {
          attemptId: attempt.id,
          assessmentQuestionId: aq.id,
          selectedAnswer,
          isCorrect,
          marksAwarded,
        },
      });

      totalObtained += marksAwarded;
      if (isCorrect) correctCount++;
      else incorrectCount++;
    }

    const totalMarks = quiz1AQs.reduce((sum, aq) => sum + aq.marks, 0);
    await prisma.assessmentResult.create({
      data: {
        attemptId: attempt.id,
        studentId: students[si].id,
        assessmentId: mathQuiz1.id,
        totalMarks,
        obtainedMarks: totalObtained,
        percentage: Math.round((totalObtained / totalMarks) * 100 * 100) / 100,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        unanswered: 0,
      },
    });
  }

  // ===== 20. PERFORMANCE RECORDS =====
  console.log('  📊 Creating performance records...');
  // Calculate performance records for first student (Sahan Perera) across topics
  const performanceData = [
    { topicName: 'Algebra', percentage: 85, level: PerformanceLevel.STRONG },
    { topicName: 'Functions', percentage: 40, level: PerformanceLevel.WEAK },
    { topicName: 'Trigonometry', percentage: 72, level: PerformanceLevel.NEEDS_PRACTICE },
    { topicName: 'Differentiation', percentage: 55, level: PerformanceLevel.NEEDS_PRACTICE },
  ];

  for (const perf of performanceData) {
    const topic = mathTopics.find(t => t.name === perf.topicName);
    if (topic) {
      await prisma.performanceRecord.create({
        data: {
          studentId: students[0].id,
          subjectId: subjects[0].id,
          topicId: topic.id,
          averagePercentage: perf.percentage,
          totalAttempts: 2,
          totalCorrect: Math.round(perf.percentage / 10),
          totalIncorrect: 10 - Math.round(perf.percentage / 10),
          level: perf.level,
        },
      });
    }
  }

  // Overall math performance for student 0
  await prisma.performanceRecord.create({
    data: {
      studentId: students[0].id,
      subjectId: subjects[0].id,
      topicId: null,
      averagePercentage: 63,
      totalAttempts: 2,
      totalCorrect: 15,
      totalIncorrect: 9,
      level: PerformanceLevel.NEEDS_PRACTICE,
    },
  });

  // Performance for second student (weak in functions)
  const student1PerfData = [
    { topicName: 'Algebra', percentage: 60, level: PerformanceLevel.NEEDS_PRACTICE },
    { topicName: 'Functions', percentage: 20, level: PerformanceLevel.WEAK },
    { topicName: 'Trigonometry', percentage: 45, level: PerformanceLevel.WEAK },
  ];

  for (const perf of student1PerfData) {
    const topic = mathTopics.find(t => t.name === perf.topicName);
    if (topic) {
      await prisma.performanceRecord.create({
        data: {
          studentId: students[1].id,
          subjectId: subjects[0].id,
          topicId: topic.id,
          averagePercentage: perf.percentage,
          totalAttempts: 1,
          totalCorrect: Math.round(perf.percentage / 10),
          totalIncorrect: 10 - Math.round(perf.percentage / 10),
          level: perf.level,
        },
      });
    }
  }

  // ===== 21. RECOMMENDATIONS =====
  console.log('  💡 Creating recommendations...');
  const functionsTopicId = mathTopics[1].id;
  // Recommendation for student 0 (Functions weak at 40%)
  await prisma.recommendation.createMany({
    data: [
      {
        studentId: students[0].id,
        topicId: functionsTopicId,
        subjectId: subjects[0].id,
        type: RecommendationType.LESSON,
        message: 'Functions has been identified as an area that may require additional practice. Review the Functions lesson to strengthen your understanding.',
      },
      {
        studentId: students[0].id,
        topicId: functionsTopicId,
        subjectId: subjects[0].id,
        type: RecommendationType.MATERIAL,
        message: 'Access the Functions study materials and video tutorials to reinforce key concepts.',
      },
      {
        studentId: students[0].id,
        topicId: functionsTopicId,
        subjectId: subjects[0].id,
        type: RecommendationType.PRACTICE_QUESTIONS,
        message: 'Complete the Functions practice questions to test your understanding.',
      },
      {
        studentId: students[0].id,
        topicId: functionsTopicId,
        subjectId: subjects[0].id,
        type: RecommendationType.QUIZ,
        message: 'Attempt the Functions quiz to measure your improvement.',
      },
    ],
  });

  // Recommendation for student 1 (Functions weak at 20%, Trigonometry weak at 45%)
  const trigTopicId = mathTopics[2].id;
  await prisma.recommendation.createMany({
    data: [
      {
        studentId: students[1].id,
        topicId: functionsTopicId,
        subjectId: subjects[0].id,
        type: RecommendationType.LESSON,
        message: 'Functions requires immediate attention. Start by reviewing the lesson materials.',
      },
      {
        studentId: students[1].id,
        topicId: functionsTopicId,
        subjectId: subjects[0].id,
        type: RecommendationType.PRACTICE_QUESTIONS,
        message: 'Practice Functions questions to build your confidence.',
      },
      {
        studentId: students[1].id,
        topicId: trigTopicId,
        subjectId: subjects[0].id,
        type: RecommendationType.LESSON,
        message: 'Trigonometry needs additional practice. Review the trigonometry lesson.',
      },
      {
        studentId: students[1].id,
        topicId: trigTopicId,
        subjectId: subjects[0].id,
        type: RecommendationType.QUIZ,
        message: 'Attempt the Trigonometry practice test to measure your understanding.',
      },
    ],
  });

  // ===== 22. NOTIFICATIONS =====
  console.log('  🔔 Creating notifications...');
  // Notifications for student 0
  const student0User = await prisma.student.findUnique({ where: { id: students[0].id }, select: { userId: true } });
  if (student0User) {
    await prisma.notification.createMany({
      data: [
        {
          userId: student0User.userId,
          title: 'New Assessment Available',
          message: 'Mathematics Quiz 1 - Algebra & Functions is now available. Complete it before the deadline.',
          type: NotificationType.NEW_ASSESSMENT,
          linkUrl: '/student/assessments',
        },
        {
          userId: student0User.userId,
          title: 'Result Released',
          message: 'Your result for Mathematics Quiz 1 has been released. Check your performance.',
          type: NotificationType.RESULT_RELEASED,
          isRead: true,
          linkUrl: '/student/results',
        },
        {
          userId: student0User.userId,
          title: 'New Recommendation',
          message: 'Based on your performance, we recommend reviewing Functions. Check your recommendations.',
          type: NotificationType.NEW_RECOMMENDATION,
          linkUrl: '/student/recommendations',
        },
        {
          userId: student0User.userId,
          title: 'Assignment Due Soon',
          message: 'Mathematics Assignment 1 is due on September 30. Submit before the deadline.',
          type: NotificationType.ASSIGNMENT_DEADLINE,
          linkUrl: '/student/assignments',
        },
      ],
    });
  }

  // Notifications for first parent
  const parent0 = await prisma.parent.findFirst({ include: { user: true } });
  if (parent0) {
    await prisma.notification.createMany({
      data: [
        {
          userId: parent0.userId,
          title: 'New Assessment Result',
          message: 'Your child\'s Mathematics Quiz 1 result has been released.',
          type: NotificationType.NEW_RESULT,
          linkUrl: '/parent/children',
        },
        {
          userId: parent0.userId,
          title: 'Academic Update',
          message: 'New learning materials have been uploaded for Mathematics.',
          type: NotificationType.ACADEMIC_UPDATE,
        },
      ],
    });
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Login Credentials (all passwords: Password@123):');
  console.log('  Admin:   admin@lpfacademy.com');
  console.log('  Teacher: t.silva@lpfacademy.com');
  console.log('  Student: s.perera@lpfacademy.com');
  console.log('  Parent:  p.perera@lpfacademy.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

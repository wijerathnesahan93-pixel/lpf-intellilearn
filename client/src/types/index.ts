export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  teacher?: Teacher;
  parent?: ParentProfile;
}

export interface Student {
  id: string;
  userId: string;
  admissionNumber: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  phone?: string;
  user?: Pick<User, 'firstName' | 'lastName' | 'email'>;
}

export interface Teacher {
  id: string;
  userId: string;
  employeeId: string;
  qualification?: string;
  specialization?: string;
  phone?: string;
  user?: Pick<User, 'firstName' | 'lastName' | 'email'>;
}

export interface ParentProfile {
  id: string;
  userId: string;
  phone?: string;
  occupation?: string;
  address?: string;
  children?: ParentChild[];
  user?: Pick<User, 'firstName' | 'lastName' | 'email'>;
}

export type Parent = ParentProfile;

export interface ParentChild {
  id: string;
  parentId: string;
  studentId: string;
  relationship: string;
  student?: Student;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Class {
  id: string;
  name: string;
  academicYearId: string;
  grade: number;
  section: string;
  capacity: number;
  academicYear?: AcademicYear;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  courseId: string;
  description?: string;
  course?: Course;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  orderIndex: number;
  description?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  enrolledAt: string;
  student?: Student;
  class?: Class;
  subject?: Subject;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  topicId?: string;
  teacherId: string;
  orderIndex: number;
  isPublished: boolean;
  subject?: Subject;
  topic?: Topic;
  teacher?: Teacher;
}

export interface LearningMaterial {
  id: string;
  title: string;
  description?: string;
  type: 'PDF' | 'DOCUMENT' | 'PRESENTATION' | 'VIDEO' | 'IMAGE' | 'REFERENCE';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  subjectId: string;
  topicId?: string;
  teacherId: string;
  isPublished: boolean;
  subject?: Subject;
  topic?: Topic;
}

export interface Assignment {
  id: string;
  title: string;
  instructions?: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  totalMarks: number;
  dueDate: string;
  isPublished: boolean;
  subject?: Subject;
  class?: Class;
  teacher?: Teacher;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string;
  fileUrl?: string;
  status: 'PENDING' | 'SUBMITTED' | 'LATE' | 'REVIEWED' | 'RETURNED';
  marks?: number;
  feedback?: string;
  submittedAt?: string;
  reviewedAt?: string;
  student?: Student;
  assignment?: Assignment;
}

export interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
  correctAnswer: string;
  explanation?: string;
  subjectId: string;
  topicId: string;
  subject?: Subject;
  topic?: Topic;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  instructions?: string;
  type: 'QUIZ' | 'PRACTICE_TEST' | 'MODEL_PAPER' | 'PAST_PAPER' | 'MOCK_EXAM';
  subjectId: string;
  teacherId: string;
  classId?: string;
  totalMarks: number;
  duration: number;
  maxAttempts: number;
  availableFrom?: string;
  availableTo?: string;
  isPublished: boolean;
  subject?: Subject;
  teacher?: Teacher;
  questions?: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  questionId: string;
  orderIndex: number;
  marks: number;
  question?: Question;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  studentId: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT';
  assessment?: Assessment;
  answers?: StudentAnswer[];
  result?: AssessmentResult;
}

export interface StudentAnswer {
  id: string;
  attemptId: string;
  assessmentQuestionId: string;
  selectedAnswer?: string;
  isCorrect?: boolean;
  marksAwarded: number;
}

export interface AssessmentResult {
  id: string;
  attemptId: string;
  studentId: string;
  assessmentId: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  createdAt: string;
  assessment?: Assessment;
}

export interface PerformanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  topicId?: string;
  averagePercentage: number;
  totalAttempts: number;
  totalCorrect: number;
  totalIncorrect: number;
  level: 'STRONG' | 'NEEDS_PRACTICE' | 'WEAK';
  subject?: Subject;
  topic?: Topic;
}

export interface Recommendation {
  id: string;
  studentId: string;
  topicId: string;
  subjectId: string;
  type: 'LESSON' | 'MATERIAL' | 'PRACTICE_QUESTIONS' | 'QUIZ';
  message: string;
  resourceId?: string;
  resourceType?: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
  topic?: Topic;
  subject?: Subject;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  data: T;
  meta?: any;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

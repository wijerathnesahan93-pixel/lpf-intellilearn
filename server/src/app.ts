import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/error.middleware';

// Import all routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import studentRoutes from './modules/students/students.routes';
import teacherRoutes from './modules/teachers/teachers.routes';
import parentRoutes from './modules/parents/parents.routes';
import academicYearRoutes from './modules/academic-years/academic-years.routes';
import classRoutes from './modules/classes/classes.routes';
import courseRoutes from './modules/courses/courses.routes';
import subjectRoutes from './modules/subjects/subjects.routes';
import topicRoutes from './modules/topics/topics.routes';
import enrollmentRoutes from './modules/enrollments/enrollments.routes';
import teacherAssignmentRoutes from './modules/teacher-assignments/teacher-assignments.routes';
import lessonRoutes from './modules/lessons/lessons.routes';
import materialRoutes from './modules/materials/materials.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import configRoutes from './modules/config/config.routes';
import assignmentRoutes from './modules/assignments/assignments.routes';
import questionRoutes from './modules/questions/questions.routes';
import assessmentRoutes from './modules/assessments/assessments.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import recommendationRoutes from './modules/recommendations/recommendations.routes';
import notificationRoutes from './modules/notifications/notifications.routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(config.upload.dir));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/teacher-assignments', teacherAssignmentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', configRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/assessments', assessmentRoutes);

// Error handling
app.use(errorHandler);

export default app;

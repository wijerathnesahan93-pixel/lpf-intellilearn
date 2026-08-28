import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardRedirect } from './pages/DashboardRedirect';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import StudentsPage from './pages/admin/StudentsPage';
import TeachersPage from './pages/admin/TeachersPage';
import ParentsPage from './pages/admin/ParentsPage';
import AcademicYearsPage from './pages/admin/AcademicYearsPage';
import ClassesPage from './pages/admin/ClassesPage';
import CoursesPage from './pages/admin/CoursesPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import TopicsPage from './pages/admin/TopicsPage';
import EnrollmentsPage from './pages/admin/EnrollmentsPage';
import SystemConfigPage from './pages/admin/SystemConfigPage';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAssignmentsPage from './pages/teacher/TeacherAssignmentsPage';
import TeacherSubmissionsPage from './pages/teacher/TeacherSubmissionsPage';
import TeacherQuestionsPage from './pages/teacher/TeacherQuestionsPage';
import TeacherAssessmentsPage from './pages/teacher/TeacherAssessmentsPage';
import TeacherAnalyticsPage from './pages/teacher/TeacherAnalyticsPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentSubjectsPage from './pages/student/StudentSubjectsPage';
import StudentLessonsPage from './pages/student/StudentLessonsPage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import StudentAssessmentsPage from './pages/student/StudentAssessmentsPage';
import StudentResultsPage from './pages/student/StudentResultsPage';
import StudentPerformancePage from './pages/student/StudentPerformancePage';
import StudentRecommendationsPage from './pages/student/StudentRecommendationsPage';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentChildrenPage from './pages/parent/ParentChildrenPage';
import ParentNotificationsPage from './pages/parent/ParentNotificationsPage';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-6 bg-white rounded-lg shadow">
    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    <p className="text-gray-500 mt-2">This feature is under development.</p>
  </div>
);

const App = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardRedirect />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Admin Routes */}
        <Route path="/admin">
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
          <Route path="students" element={<ProtectedRoute allowedRoles={['ADMIN']}><StudentsPage /></ProtectedRoute>} />
          <Route path="teachers" element={<ProtectedRoute allowedRoles={['ADMIN']}><TeachersPage /></ProtectedRoute>} />
          <Route path="parents" element={<ProtectedRoute allowedRoles={['ADMIN']}><ParentsPage /></ProtectedRoute>} />
          <Route path="academic-years" element={<ProtectedRoute allowedRoles={['ADMIN']}><AcademicYearsPage /></ProtectedRoute>} />
          <Route path="classes" element={<ProtectedRoute allowedRoles={['ADMIN']}><ClassesPage /></ProtectedRoute>} />
          <Route path="courses" element={<ProtectedRoute allowedRoles={['ADMIN']}><CoursesPage /></ProtectedRoute>} />
          <Route path="subjects" element={<ProtectedRoute allowedRoles={['ADMIN']}><SubjectsPage /></ProtectedRoute>} />
          <Route path="topics" element={<ProtectedRoute allowedRoles={['ADMIN']}><TopicsPage /></ProtectedRoute>} />
          <Route path="enrollments" element={<ProtectedRoute allowedRoles={['ADMIN']}><EnrollmentsPage /></ProtectedRoute>} />
          <Route path="config" element={<ProtectedRoute allowedRoles={['ADMIN']}><SystemConfigPage /></ProtectedRoute>} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher">
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="classes" element={<ProtectedRoute allowedRoles={['TEACHER']}><PlaceholderPage title="My Classes" /></ProtectedRoute>} />
          <Route path="subjects" element={<ProtectedRoute allowedRoles={['TEACHER']}><PlaceholderPage title="My Subjects" /></ProtectedRoute>} />
          <Route path="assignments" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherAssignmentsPage /></ProtectedRoute>} />
          <Route path="submissions" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherSubmissionsPage /></ProtectedRoute>} />
          <Route path="questions" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherQuestionsPage /></ProtectedRoute>} />
          <Route path="assessments" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherAssessmentsPage /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherAnalyticsPage /></ProtectedRoute>} />
        </Route>

        {/* Student Routes */}
        <Route path="/student">
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="subjects" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentSubjectsPage /></ProtectedRoute>} />
          <Route path="lessons" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentLessonsPage /></ProtectedRoute>} />
          <Route path="assignments" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentAssignmentsPage /></ProtectedRoute>} />
          <Route path="assessments" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentAssessmentsPage /></ProtectedRoute>} />
          <Route path="results" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentResultsPage /></ProtectedRoute>} />
          <Route path="performance" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentPerformancePage /></ProtectedRoute>} />
          <Route path="recommendations" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentRecommendationsPage /></ProtectedRoute>} />
        </Route>

        {/* Parent Routes */}
        <Route path="/parent">
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['PARENT']}><ParentDashboard /></ProtectedRoute>} />
          <Route path="children" element={<ProtectedRoute allowedRoles={['PARENT']}><ParentChildrenPage /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute allowedRoles={['PARENT']}><ParentNotificationsPage /></ProtectedRoute>} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;


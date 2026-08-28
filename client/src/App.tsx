import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import AcademicYearsPage from './pages/admin/AcademicYearsPage';
import ClassesPage from './pages/admin/ClassesPage';
import CoursesPage from './pages/admin/CoursesPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import SystemConfigPage from './pages/admin/SystemConfigPage';
import EnrollmentsPage from './pages/admin/EnrollmentsPage';

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

const App = () => {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={`/${user?.role.toLowerCase()}`} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
        <Route path="/" element={<Navigate to={`/${user?.role.toLowerCase()}`} />} />
        
        {/* Admin Routes */}
        {user?.role === 'ADMIN' && (
          <Route path="/admin">
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="academic-years" element={<AcademicYearsPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="enrollments" element={<EnrollmentsPage />} />
            <Route path="settings" element={<SystemConfigPage />} />
          </Route>
        )}

        {/* Teacher Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/teacher/dashboard" element={<PlaceholderPage title="Teacher Dashboard" />} />
          <Route path="/teacher/classes" element={<PlaceholderPage title="My Classes" />} />
          <Route path="/teacher/subjects" element={<PlaceholderPage title="My Subjects" />} />
          <Route path="/teacher/assignments" element={<PlaceholderPage title="Assignments" />} />
          <Route path="/teacher/questions" element={<PlaceholderPage title="Question Bank" />} />
          <Route path="/teacher/assessments" element={<PlaceholderPage title="Assessments" />} />
          <Route path="/teacher/analytics" element={<PlaceholderPage title="Analytics" />} />
        </Route>

        {/* Student Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/student/dashboard" element={<PlaceholderPage title="Student Dashboard" />} />
          <Route path="/student/subjects" element={<PlaceholderPage title="My Subjects" />} />
          <Route path="/student/assignments" element={<PlaceholderPage title="Assignments" />} />
          <Route path="/student/assessments" element={<PlaceholderPage title="Assessments" />} />
          <Route path="/student/results" element={<PlaceholderPage title="Results" />} />
          <Route path="/student/performance" element={<PlaceholderPage title="Performance" />} />
          <Route path="/student/recommendations" element={<PlaceholderPage title="Recommendations" />} />
        </Route>

        {/* Parent Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['PARENT']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/parent/dashboard" element={<PlaceholderPage title="Parent Dashboard" />} />
          <Route path="/parent/children" element={<PlaceholderPage title="My Children" />} />
          <Route path="/parent/notifications" element={<PlaceholderPage title="Notifications" />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

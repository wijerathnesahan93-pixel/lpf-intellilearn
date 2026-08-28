import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/logo.jpg';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  ClipboardCheck,
  BarChart3,
  Lightbulb,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserCircle,
  Calendar,
  Layers,
  FolderOpen,
  BookMarked,
  HelpCircle,
  UserCog,
  School,
} from 'lucide-react';
import { clsx } from 'clsx';
import { UserRole } from '../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case 'ADMIN':
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
        { label: 'Students', path: '/admin/students', icon: <School className="w-5 h-5" /> },
        { label: 'Teachers', path: '/admin/teachers', icon: <UserCog className="w-5 h-5" /> },
        { label: 'Parents', path: '/admin/parents', icon: <Users className="w-5 h-5" /> },
        { label: 'Academic Years', path: '/admin/academic-years', icon: <Calendar className="w-5 h-5" /> },
        { label: 'Classes', path: '/admin/classes', icon: <Layers className="w-5 h-5" /> },
        { label: 'Courses', path: '/admin/courses', icon: <FolderOpen className="w-5 h-5" /> },
        { label: 'Subjects', path: '/admin/subjects', icon: <BookOpen className="w-5 h-5" /> },
        { label: 'Enrollments', path: '/admin/enrollments', icon: <ClipboardCheck className="w-5 h-5" /> },
        { label: 'Reports', path: '/admin/reports', icon: <BarChart3 className="w-5 h-5" /> },
        { label: 'Settings', path: '/admin/config', icon: <Settings className="w-5 h-5" /> },
      ];
    case 'TEACHER':
      return [
        { label: 'Dashboard', path: '/teacher/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'My Classes', path: '/teacher/classes', icon: <Layers className="w-5 h-5" /> },
        { label: 'My Subjects', path: '/teacher/subjects', icon: <BookOpen className="w-5 h-5" /> },
        { label: 'Assignments', path: '/teacher/assignments', icon: <FileText className="w-5 h-5" /> },
        { label: 'Question Bank', path: '/teacher/questions', icon: <HelpCircle className="w-5 h-5" /> },
        { label: 'Assessments', path: '/teacher/assessments', icon: <ClipboardCheck className="w-5 h-5" /> },
        { label: 'Analytics', path: '/teacher/analytics', icon: <BarChart3 className="w-5 h-5" /> },
      ];
    case 'STUDENT':
      return [
        { label: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'My Subjects', path: '/student/subjects', icon: <BookOpen className="w-5 h-5" /> },
        { label: 'Assignments', path: '/student/assignments', icon: <FileText className="w-5 h-5" /> },
        { label: 'Assessments', path: '/student/assessments', icon: <ClipboardCheck className="w-5 h-5" /> },
        { label: 'Results', path: '/student/results', icon: <BookMarked className="w-5 h-5" /> },
        { label: 'Performance', path: '/student/performance', icon: <BarChart3 className="w-5 h-5" /> },
        { label: 'Recommendations', path: '/student/recommendations', icon: <Lightbulb className="w-5 h-5" /> },
      ];
    case 'PARENT':
      return [
        { label: 'Dashboard', path: '/parent/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'My Children', path: '/parent/children', icon: <Users className="w-5 h-5" /> },
        { label: 'Notifications', path: '/parent/notifications', icon: <Bell className="w-5 h-5" /> },
      ];
    default:
      return [];
  }
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <img src={logoImg} alt="LPF Logo" className="w-12 h-auto rounded-lg bg-white p-0.5 border border-gray-100 shadow-sm" />
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">LPF IntelliLearn</h1>
            <p className="text-xs text-gray-500">{user.role.charAt(0) + user.role.slice(1).toLowerCase()} Portal</p>
          </div>
          <button
            className="ml-auto lg:hidden p-1 text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              {/* Notification bell */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => { setUserMenuOpen(false); }}
                      >
                        <UserCircle className="w-4 h-4" />
                        Profile
                      </button>
                      <hr className="my-1 border-gray-200" />
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

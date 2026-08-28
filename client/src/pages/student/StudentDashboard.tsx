import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard.api';
import { Card } from '../../components/ui/Card';
import { DashboardCard } from '../../components/ui/DashboardCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { BookOpen, FileText, ClipboardCheck, Lightbulb, Bell, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getDashboard();
      setData(result);
      setError(null);
    } catch {
      setError('Failed to load student dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-500 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold">Hello, {user?.firstName}! 👋</h1>
        <p className="text-blue-100 mt-2 text-sm md:text-base">
          Welcome back to LPF IntelliLearn. Here is a summary of your academic progress and upcoming tasks.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Enrolled Subjects"
          value={data.enrollments?.length || 0}
          icon={<BookOpen className="w-6 h-6" />}
          color="blue"
        />
        <DashboardCard
          title="Upcoming Assignments"
          value={data.upcomingAssignments?.length || 0}
          icon={<FileText className="w-6 h-6" />}
          color="orange"
        />
        <DashboardCard
          title="Upcoming Quizzes"
          value={data.upcomingAssessments?.length || 0}
          icon={<ClipboardCheck className="w-6 h-6" />}
          color="purple"
        />
        <DashboardCard
          title="Weak Topics"
          value={data.weakTopics?.length || 0}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Tasks & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personalized Recommendations */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-bold text-gray-900">Personalized Learning Recommendations</h2>
            </div>
            {data.recommendations?.length > 0 ? (
              <div className="space-y-3">
                {data.recommendations.map((rec: any) => (
                  <div key={rec.id} className="flex gap-4 p-4 rounded-xl border border-yellow-100 bg-yellow-50/50 hover:bg-yellow-50 transition-colors">
                    <div className="p-2 bg-yellow-100 rounded-lg h-fit text-yellow-700">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{rec.subject?.name} • {rec.topic?.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{rec.message}</p>
                      <Badge variant="warning" className="mt-2">Recommended</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                🎉 Excellent job! You have no pending learning recommendations.
              </div>
            )}
          </Card>

          {/* Upcoming Assignments */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900">Upcoming Assignments</h2>
            </div>
            {data.upcomingAssignments?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.upcomingAssignments.map((assign: any) => (
                  <div key={assign.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{assign.title}</p>
                      <p className="text-xs text-gray-500">{assign.subject?.name} • Max Marks: {assign.totalMarks}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-red-600">
                        Due: {new Date(assign.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No upcoming assignments.</p>
            )}
          </Card>
        </div>

        {/* Right Side: Performance & Results */}
        <div className="space-y-6">
          {/* Recent Results */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ClipboardCheck className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900">Recent Quiz Results</h2>
            </div>
            {data.recentResults?.length > 0 ? (
              <div className="space-y-4">
                {data.recentResults.map((res: any) => (
                  <div key={res.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-700">{res.assessment?.title}</span>
                      <span className="text-gray-500">{res.obtainedMarks}/{res.totalMarks} marks</span>
                    </div>
                    <ProgressBar value={res.percentage} showLabel />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No quiz results available yet.</p>
            )}
          </Card>

          {/* Performance Records */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900">Recent Notifications</h2>
            </div>
            {data.notifications?.length > 0 ? (
              <div className="space-y-3">
                {data.notifications.map((notif: any) => (
                  <div key={notif.id} className="text-xs p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="font-semibold text-gray-800">{notif.title}</p>
                    <p className="text-gray-600 mt-0.5">{notif.message}</p>
                    <span className="text-gray-400 block mt-1">{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No new notifications.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

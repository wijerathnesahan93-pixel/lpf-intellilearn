import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard.api';
import { Card } from '../../components/ui/Card';
import { DashboardCard } from '../../components/ui/DashboardCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { BookOpen, FileText, ClipboardCheck, Users, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function TeacherDashboard() {
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
      setError('Failed to load teacher dashboard data');
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
      <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user?.firstName}! 🎓</h1>
        <p className="text-green-100 mt-2 text-sm md:text-base">
          LPF Academy Teacher Portal. Monitor assignments grading, view class lists, and track assessment progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Assigned Classes/Subjects"
          value={data.assignedSubjects?.length || 0}
          icon={<BookOpen className="w-6 h-6" />}
          color="blue"
        />
        <DashboardCard
          title="Pending Submissions to Grade"
          value={data.pendingSubmissions || 0}
          icon={<FileText className="w-6 h-6" />}
          color="orange"
        />
        <DashboardCard
          title="Active/Upcoming Assessments"
          value={data.upcomingAssessments?.length || 0}
          icon={<ClipboardCheck className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Assigned Subjects & Upcoming Assessments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Subjects */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900">Your Assigned Subjects & Classes</h2>
            </div>
            {data.assignedSubjects?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.assignedSubjects.map((item: any) => (
                  <div key={item.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{item.subject?.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Code: {item.subject?.code}</p>
                      <Badge variant="info" className="mt-2">Class: {item.class?.name}</Badge>
                    </div>
                    <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No assigned subjects found.</p>
            )}
          </Card>

          {/* Upcoming Assessments */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ClipboardCheck className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900">Active / Upcoming Assessments</h2>
            </div>
            {data.upcomingAssessments?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.upcomingAssessments.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-500">{a.subject?.name} • Duration: {a.duration} mins • Max Attempts: {a.maxAttempts}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-500 block">Available Until</span>
                      <span className="text-xs text-red-600 font-semibold">{new Date(a.availableTo).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No active/upcoming assessments.</p>
            )}
          </Card>
        </div>

        {/* Right Side: Recent Results */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-bold text-gray-900">Recent Student Quiz Scores</h2>
            </div>
            {data.recentResults?.length > 0 ? (
              <div className="space-y-4">
                {data.recentResults.map((res: any) => (
                  <div key={res.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {res.student?.user?.firstName} {res.student?.user?.lastName}
                      </p>
                      <p className="text-xxs text-gray-500">{res.assessment?.title}</p>
                      <span className="text-xxs text-gray-400 block mt-1">Submitted: {new Date(res.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-green-600 block">{res.percentage}%</span>
                      <span className="text-xxs text-gray-400">{res.obtainedMarks}/{res.totalMarks} marks</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No student scores available yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

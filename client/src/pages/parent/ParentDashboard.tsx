import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Users, GraduationCap, ClipboardCheck, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ParentDashboard() {
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
      setError('Failed to load parent dashboard data');
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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold">Hello, {user?.firstName}! 👪</h1>
        <p className="text-purple-100 mt-2 text-sm md:text-base">
          LPF Academy Parent Portal. Keep track of your children's academic performance, grades, and weak study areas.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left/Middle: Children List (col-span-2) */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Your Children
          </h2>
          {data.children?.length > 0 ? (
            data.children.map((childObj: any) => {
              const child = childObj.student;
              const weakTopics = child.performanceRecords?.filter((p: any) => p.level === 'WEAK') || [];
              const strongTopics = child.performanceRecords?.filter((p: any) => p.level === 'STRONG') || [];

              return (
                <Card key={child.id} className="space-y-6">
                  {/* Child header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-100 text-indigo-700 rounded-full">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{child.user?.firstName} {child.user?.lastName}</h3>
                        <p className="text-xs text-gray-500">Admission No: {child.admissionNumber} • Email: {child.user?.email}</p>
                      </div>
                    </div>
                    <div>
                      <Badge variant="info" size="md">
                        Enrolled Class: {child.enrollments?.[0]?.class?.name || 'Unassigned'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Child enrolled subjects */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        Subjects Enrolled
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {child.enrollments?.map((e: any) => (
                          <span key={e.id} className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg">
                            {e.subject?.name}
                          </span>
                        )) || <p className="text-xs text-gray-400">No enrolled subjects found.</p>}
                      </div>
                    </div>

                    {/* Performance breakdown summary */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Study Area Focus
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-red-50 border border-red-100 text-red-700">
                          <span className="font-bold block text-lg">{weakTopics.length}</span>
                          Weak Topics (Need Help)
                        </div>
                        <div className="p-2.5 rounded-lg bg-green-50 border border-green-100 text-green-700">
                          <span className="font-bold block text-lg">{strongTopics.length}</span>
                          Strong Topics
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Child recent results */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-purple-500" />
                      Recent Quiz Scores
                    </h4>
                    {child.assessmentResults?.length > 0 ? (
                      <div className="space-y-3">
                        {child.assessmentResults.map((res: any) => (
                          <div key={res.id} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-gray-700">{res.assessment?.title} ({res.assessment?.subject?.name})</span>
                              <span className="text-gray-500 font-semibold">{res.obtainedMarks}/{res.totalMarks} marks</span>
                            </div>
                            <ProgressBar value={res.percentage} showLabel />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No quiz scores available yet.</p>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 py-6 text-center bg-white rounded-xl border border-gray-200">
              No children mapped to this parent profile.
            </p>
          )}
        </div>

        {/* Right Side: Notifications */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Unread Alerts
          </h2>
          <Card>
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

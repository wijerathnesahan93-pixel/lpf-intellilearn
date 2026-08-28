import { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard.api';
import { DashboardCard } from '../../components/ui/DashboardCard';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Users, GraduationCap, BookOpen, Layers, FolderOpen, UserCog } from 'lucide-react';

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getDashboard();
      setData(result);
      setError(null);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard title="Total Students" value={data.totalStudents || 0} icon={<GraduationCap className="w-6 h-6" />} color="blue" />
        <DashboardCard title="Total Teachers" value={data.totalTeachers || 0} icon={<UserCog className="w-6 h-6" />} color="green" />
        <DashboardCard title="Total Parents" value={data.totalParents || 0} icon={<Users className="w-6 h-6" />} color="purple" />
        <DashboardCard title="Total Subjects" value={data.totalSubjects || 0} icon={<BookOpen className="w-6 h-6" />} color="orange" />
        <DashboardCard title="Total Classes" value={data.totalClasses || 0} icon={<Layers className="w-6 h-6" />} color="blue" />
        <DashboardCard title="Total Courses" value={data.totalCourses || 0} icon={<FolderOpen className="w-6 h-6" />} color="green" />
      </div>
      
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Assessments</h2>
        {data.recentAssessments?.length > 0 ? (
          <div className="space-y-3">
            {data.recentAssessments.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.subject?.name} • {a.type}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No assessments yet.</p>
        )}
      </Card>
    </div>
  );
}

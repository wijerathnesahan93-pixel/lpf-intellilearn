import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Users, GraduationCap, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ParentChildrenPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getDashboard();
      setData(result);
      setError(null);
    } catch {
      setError('Failed to load child details records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchChildren} />;
  if (!data) return null;

  const children = data.children || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 md:p-8 text-white shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-100" />
            My Children
          </h1>
          <p className="text-purple-100 mt-2 text-sm md:text-base">
            Detailed list of your linked children profiles, class assignments, and active topics progress.
          </p>
        </div>
        <div className="hidden sm:block">
          <GraduationCap className="w-16 h-16 text-purple-200/50" />
        </div>
      </div>

      {/* Children list detailed cards */}
      {children.length > 0 ? (
        <div className="space-y-6">
          {children.map((childObj: any) => {
            const child = childObj.student;
            const weakTopics = child.performanceRecords?.filter((p: any) => p.level === 'WEAK' || p.averagePercentage < 50) || [];
            const strongTopics = child.performanceRecords?.filter((p: any) => p.level === 'STRONG' || p.averagePercentage >= 75) || [];

            return (
              <Card key={child.id} className="space-y-6 border border-gray-100">
                {/* Child Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {child.user?.firstName} {child.user?.lastName}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Admission No: {child.admissionNumber} • Email: {child.user?.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="info" size="md">
                    Enrolled Class: {child.enrollments?.[0]?.class?.name || 'Unassigned'}
                  </Badge>
                </div>

                {/* Subsections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Subjects Enrolled */}
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

                  {/* Strong Topics */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Strong Areas
                    </h4>
                    {strongTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {strongTopics.map((st: any) => (
                          <span key={st.id} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                            {st.topic?.name || st.subject?.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No strong performance records registered yet.</p>
                    )}
                  </div>

                  {/* Weak Topics */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Needs Focus
                    </h4>
                    {weakTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {weakTopics.map((wt: any) => (
                          <span key={wt.id} className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100">
                            {wt.topic?.name || wt.subject?.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 italic">No weak performance warnings flagged.</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center flex flex-col items-center">
          <Users className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Children Linked</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Your parent profile is not linked to any active students. Contact the LPF Academy administration office to register your children.
          </p>
        </Card>
      )}
    </div>
  );
}

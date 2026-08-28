import React, { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../../api/analytics.api';
import { dashboardApi } from '../../api/dashboard.api';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { BarChart3, Users, BookOpen, AlertTriangle, ChevronRight, Award } from 'lucide-react';

export default function TeacherAnalyticsPage() {
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [records, setRecords] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssigned = useCallback(async () => {
    try {
      setLoading(true);
      const dbRes = await dashboardApi.getDashboard();
      const list = dbRes.assignedSubjects || [];
      setAssignedSubjects(list);
      
      // Select first class by default if available
      if (list.length > 0) {
        setSelectedClassId(list[0].classId);
      }
      setError(null);
    } catch {
      setError('Failed to load classes configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClassAnalytics = useCallback(async () => {
    if (!selectedClassId) return;
    try {
      setAnalyticsLoading(true);
      const data = await analyticsApi.getClassPerformance(selectedClassId);
      setRecords(data || []);
    } catch {
      toast.error('Failed to load performance metrics for class');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned]);

  useEffect(() => {
    fetchClassAnalytics();
  }, [fetchClassAnalytics]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchAssigned} />;

  // Filter records and aggregate class statistics
  const subjectLevelRecords = records.filter((r: any) => !r.topicId);
  const topicLevelRecords = records.filter((r: any) => r.topicId);

  const classStudentsCount = new Set(records.map(r => r.studentId)).size;
  const classAvgMastery = subjectLevelRecords.length > 0
    ? Math.round(subjectLevelRecords.reduce((sum, r) => sum + r.averagePercentage, 0) / subjectLevelRecords.length)
    : 0;

  const weakClassTopics = topicLevelRecords.filter(r => r.level === 'WEAK' || r.averagePercentage < 50);

  const getLevelBadge = (level: string, percentage: number) => {
    if (level === 'STRONG' || percentage >= 75) {
      return <Badge variant="success">Strong</Badge>;
    } else if (level === 'WEAK' || percentage < 50) {
      return <Badge variant="danger">Needs Focus</Badge>;
    } else {
      return <Badge variant="warning">Practice</Badge>;
    }
  };

  const getProgressBarColor = (level: string, percentage: number) => {
    if (level === 'STRONG' || percentage >= 75) return 'bg-green-500';
    if (level === 'WEAK' || percentage < 50) return 'bg-red-500';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-6 md:p-8 text-white shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-teal-100" />
            Class Analytics & Performance
          </h1>
          <p className="text-teal-100 mt-2 text-sm md:text-base">
            Identify student scores, evaluate topic mastery levels, and schedule review lectures.
          </p>
        </div>
        <div className="hidden sm:block">
          <Users className="w-16 h-16 text-teal-200/50" />
        </div>
      </div>

      {/* Select class controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Active Class:
          </span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
          >
            {assignedSubjects.map((item: any) => (
              <option key={item.id} value={item.classId}>
                {item.class?.name} - {item.subject?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Aggregating records for {classStudentsCount} students
        </div>
      </div>

      {analyticsLoading ? (
        <LoadingState />
      ) : (
        <>
          {/* Summary Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex items-center gap-4 border border-gray-150">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Class Average Mastery</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{classAvgMastery}%</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4 border border-gray-150">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Active Students</p>
                <p className="text-2xl font-black text-indigo-700 mt-0.5">{classStudentsCount} pupils</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4 border border-gray-150">
              <div className="p-3 bg-red-50 text-red-500 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Weak Topic Areas</p>
                <p className="text-2xl font-black text-red-500 mt-0.5">{weakClassTopics.length} areas</p>
              </div>
            </Card>
          </div>

          {/* Detailed Lists */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Pupil Logs */}
            <div className="xl:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Student Performance logs
              </h3>

              {subjectLevelRecords.length > 0 ? (
                <div className="space-y-3">
                  {subjectLevelRecords.map((r: any) => {
                    const studentName = `${r.student?.user?.firstName} ${r.student?.user?.lastName}`;
                    return (
                      <Card key={r.id} className="border border-gray-100 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <h4 className="text-sm font-bold text-gray-800">{studentName}</h4>
                            <p className="text-[10px] text-gray-450 mt-0.5">Subject: {r.subject?.name}</p>
                          </div>
                          <div>{getLevelBadge(r.level, r.averagePercentage)}</div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                            <span>Topic Mastery Score</span>
                            <span>{Math.round(r.averagePercentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressBarColor(r.level, r.averagePercentage)}`}
                              style={{ width: `${r.averagePercentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-[10px] text-gray-450 mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
                          <span>Total Quiz Attempts: {r.totalAttempts}</span>
                          <span>Last Calculated: {new Date(r.lastCalculated || r.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-12 text-center text-gray-450 text-xs italic">
                  No performance metrics loaded. Students need to start submitting quizzes first!
                </Card>
              )}
            </div>

            {/* Weak Areas focusing list */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Critical Weak Topics
              </h3>

              {weakClassTopics.length > 0 ? (
                <div className="space-y-3">
                  {weakClassTopics.map((wt: any) => {
                    const studentName = `${wt.student?.user?.firstName} ${wt.student?.user?.lastName}`;
                    return (
                      <div key={wt.id} className="p-4 bg-red-50/50 border border-red-150 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded">
                            {wt.subject?.name}
                          </span>
                          <span className="text-xs font-black text-red-700">{Math.round(wt.averagePercentage)}%</span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-800">{wt.topic?.name}</h4>
                        <p className="text-[10px] text-gray-500">
                          Student: <strong>{studentName}</strong>
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-6 text-center text-gray-450 text-xs italic border border-dashed border-gray-200 bg-gray-50/30">
                  Congratulations! All students are performing at standard expectations. No critical weaknesses found.
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsApi } from '../../api/analytics.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Award, Brain, CheckCircle2, AlertTriangle, BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentPerformancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    if (!user?.student?.id) {
      setError('Student profile not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await analyticsApi.getStudentPerformance(user.student.id);
      setRecords(data || []);
      setError(null);
    } catch {
      setError('Failed to load performance analytics');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchPerformance} />;

  // Filter records
  // Overall subject-level records (where topicId is null)
  const subjectRecords = records.filter((r: any) => !r.topicId);
  // Topic-level records (where topicId is not null)
  const topicRecords = records.filter((r: any) => r.topicId);

  // Strong vs Weak topics
  const strongTopics = topicRecords.filter((r: any) => r.level === 'STRONG');
  const weakTopics = topicRecords.filter((r: any) => r.level === 'WEAK' || r.averagePercentage < 50);
  const averagePercentage = subjectRecords.length > 0
    ? Math.round(subjectRecords.reduce((sum: number, r: any) => sum + r.averagePercentage, 0) / subjectRecords.length)
    : 0;

  const getLevelBadge = (level: string, percentage: number) => {
    if (level === 'STRONG' || percentage >= 75) {
      return <Badge variant="success">Strong</Badge>;
    } else if (level === 'WEAK' || percentage < 50) {
      return <Badge variant="danger">Needs Focus</Badge>;
    } else {
      return <Badge variant="warning">Needs Practice</Badge>;
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
      <div className="bg-gradient-to-r from-teal-600 to-emerald-500 rounded-2xl p-6 md:p-8 text-white shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-teal-100" />
            Performance & Analytics
          </h1>
          <p className="text-teal-100 mt-2 text-sm md:text-base">
            Track your strengths, identify subject weaknesses, and map out your study improvements.
          </p>
        </div>
        <div className="hidden sm:block">
          <Award className="w-16 h-16 text-teal-200/50" />
        </div>
      </div>

      {/* Analytics Summary Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 border border-gray-150">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Average Score</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{averagePercentage}%</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border border-gray-150">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Strong Topics</p>
            <p className="text-2xl font-black text-green-600 mt-0.5">{strongTopics.length} topics</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border border-gray-150">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Weak Areas</p>
            <p className="text-2xl font-black text-red-500 mt-0.5">{weakTopics.length} topics</p>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side: Subject-wise Performance (2 cols) */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Subject Breakdown
          </h2>

          {subjectRecords.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {subjectRecords.map((r: any) => (
                <Card key={r.id} className="border border-gray-100 space-y-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 tracking-wider bg-indigo-50 px-2 py-0.5 rounded uppercase">
                        {r.subject?.code}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1">
                        {r.subject?.name}
                      </h3>
                    </div>
                    <div>{getLevelBadge(r.level, r.averagePercentage)}</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                      <span>Course Mastery</span>
                      <span>{Math.round(r.averagePercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressBarColor(r.level, r.averagePercentage)}`} 
                        style={{ width: `${r.averagePercentage}%` }} 
                      />
                    </div>
                  </div>

                  {/* Meta stats */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase pt-2 border-t border-gray-50">
                    <span>Attempts: {r.totalAttempts}</span>
                    <button
                      onClick={() => navigate(`/student/lessons?subjectId=${r.subject?.id}`)}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                    >
                      Study subject
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center text-gray-500 text-sm">
              No subject performance data available yet. Complete quiz assessments to populate your dashboard!
            </Card>
          )}
        </div>

        {/* Right Side: Weak Topics focus list */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Recommended Practice
          </h2>

          {weakTopics.length > 0 ? (
            <div className="space-y-3">
              {weakTopics.map((wt: any) => (
                <div key={wt.id} className="p-4 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-xl transition-colors space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      {wt.subject?.name}
                    </span>
                    <h4 className="text-sm font-semibold text-gray-800 mt-1">
                      {wt.topic?.name}
                    </h4>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Average score: {Math.round(wt.averagePercentage)}%</span>
                    <button
                      onClick={() => navigate(`/student/recommendations`)}
                      className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline"
                    >
                      Get Help &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-gray-500 text-xs border border-dashed border-gray-200 bg-gray-50/30">
              Amazing! You don't have any weak topic areas requiring urgent review. Keep maintaining your scores!
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

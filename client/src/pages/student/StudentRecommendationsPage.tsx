import React, { useState, useEffect, useCallback } from 'react';
import { recommendationsApi } from '../../api/recommendations.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Lightbulb, CheckCircle2, ArrowRight, HelpCircle, BookOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function StudentRecommendationsPage() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await recommendationsApi.list();
      // Backend returns structure { success: true, data: [...] } or direct pagination
      // Based on controller, it calls recommendationsService.getRecommendations which returns { data, total, page, limit }
      // So it is inside res.data
      setRecommendations(res.data || []);
      setError(null);
    } catch {
      setError('Failed to load learning recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleMarkComplete = async (id: string) => {
    try {
      await recommendationsApi.markCompleted(id);
      toast.success('Recommendation marked as completed!');
      fetchRecommendations();
    } catch {
      toast.error('Failed to complete recommendation');
    }
  };

  const getRecommendationTypeBadge = (type: string) => {
    switch (type) {
      case 'LESSON':
        return <Badge variant="info">Suggested Lesson</Badge>;
      case 'MATERIAL':
        return <Badge variant="warning">Reading Material</Badge>;
      case 'PRACTICE_QUESTIONS':
        return <Badge variant="info">Practice Questions</Badge>;
      case 'QUIZ':
        return <Badge variant="danger">Review Quiz</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchRecommendations} />;

  // Filter recommendations: active vs completed
  const activeRecs = recommendations.filter((r: any) => !r.isCompleted);
  const completedRecs = recommendations.filter((r: any) => r.isCompleted);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-6 md:p-8 text-white shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-amber-100" />
            AI Study Recommendations
          </h1>
          <p className="text-amber-100 mt-2 text-sm md:text-base">
            Personalised suggestions generated from your assessment performance to strengthen weak areas.
          </p>
        </div>
        <div className="hidden sm:block">
          <Lightbulb className="w-16 h-16 text-amber-200/50" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Suggestions List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Active Tasks
          </h2>

          {activeRecs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {activeRecs.map((rec: any) => (
                <Card 
                  key={rec.id} 
                  className="border border-amber-100 bg-amber-50/10 hover:bg-amber-50/20 hover:shadow-sm transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {rec.subject?.name}
                      </span>
                      {getRecommendationTypeBadge(rec.type)}
                    </div>
                    
                    <h3 className="text-base font-bold text-gray-800">
                      Focus: {rec.topic?.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                      {rec.message}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100/50 flex items-center justify-between gap-4">
                    <button
                      onClick={() => handleMarkComplete(rec.id)}
                      className="px-4 py-2 border border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-600 hover:text-green-700 text-xs font-bold rounded-xl transition-all"
                    >
                      Mark Complete
                    </button>
                    
                    <button
                      onClick={() => navigate(`/student/lessons?subjectId=${rec.subjectId}`)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
                    >
                      Study Topic
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-gray-200 bg-gray-50/30">
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-800">You are all caught up!</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                No new learning recommendations. Finish more assessment quizzes to get customized AI guidance.
              </p>
            </Card>
          )}
        </div>

        {/* Completed History List (1 col) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Completed Tasks
          </h2>

          {completedRecs.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {completedRecs.map((rec: any) => (
                <div key={rec.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 opacity-75">
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                    <span>{rec.subject?.name}</span>
                    <span className="text-green-600">Completed</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-700">
                    {rec.topic?.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 line-clamp-2 italic">
                    "{rec.message}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-xs text-gray-400 italic">
              No completed recommendation history.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

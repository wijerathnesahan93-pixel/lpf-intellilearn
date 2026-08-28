import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboard.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { BookOpen, FileText, ClipboardCheck, ArrowRight, Search, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentSubjectsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getDashboard();
      setData(result);
      setError(null);
    } catch {
      setError('Failed to load your enrolled subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchSubjects} />;

  const enrollments = data?.enrollments || [];
  
  const filteredEnrollments = enrollments.filter((e: any) => {
    const subjectName = e.subject?.name?.toLowerCase() || '';
    const subjectCode = e.subject?.code?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return subjectName.includes(query) || subjectCode.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-500 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-100" />
          My Enrolled Subjects
        </h1>
        <p className="text-indigo-100 mt-2 text-sm md:text-base">
          Browse your enrolled classes, subjects, topics, and course materials.
        </p>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subjects by name or code..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors bg-gray-50/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Showing {filteredEnrollments.length} of {enrollments.length} subjects
        </div>
      </div>

      {/* Grid List */}
      {filteredEnrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((e: any) => {
            const subject = e.subject;
            const classObj = e.class;
            
            return (
              <Card 
                key={e.id} 
                className="group hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                        <BookOpen className="w-5 h-5" />
                      </span>
                      <div>
                        <span className="text-xs font-bold text-indigo-600 tracking-wider bg-indigo-50/50 px-2 py-0.5 rounded">
                          {subject?.code}
                        </span>
                      </div>
                    </div>
                    {classObj && (
                      <Badge variant="info" size="sm">
                        Class: {classObj.name}
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {subject?.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                    {subject?.description || 'No description available for this subject.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <button
                      onClick={() => navigate(`/student/lessons?subjectId=${subject?.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold rounded-xl transition-all duration-300"
                    >
                      Browse Lessons
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => navigate(`/student/assignments?subjectId=${subject?.id}`)}
                      className="inline-flex items-center justify-center p-2 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 text-gray-600 rounded-xl transition-all duration-300"
                      title="View Assignments"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => navigate(`/student/assessments?subjectId=${subject?.id}`)}
                      className="inline-flex items-center justify-center p-2 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 text-gray-600 rounded-xl transition-all duration-300"
                      title="View Quizzes"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center text-center p-12 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="p-4 bg-indigo-50 rounded-full text-indigo-500 mb-4">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Subjects Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mt-2">
            {searchQuery ? "We couldn't find any subjects matching your search query." : "You are not enrolled in any subjects at the moment."}
          </p>
        </Card>
      )}
    </div>
  );
}

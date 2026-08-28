import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { assignmentsApi } from '../../api/assignments.api';
import { dashboardApi } from '../../api/dashboard.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { FileText, ClipboardCheck, ArrowLeft, Calendar, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentAssignmentsPage() {
  const [searchParams] = useSearchParams();
  const subjectIdParam = searchParams.get('subjectId');
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeSubjectId, setActiveSubjectId] = useState<string>(subjectIdParam || 'all');
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted'>('pending');

  // Submit Modal State
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');

  // Details Modal State (for viewed graded submissions)
  const [viewingSubmission, setViewingSubmission] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dbRes, assignmentsRes, mySubmissionsRes] = await Promise.all([
        dashboardApi.getDashboard(),
        assignmentsApi.list({ page: 1, limit: 100 }),
        assignmentsApi.getMySubmissions()
      ]);

      const enrollments = dbRes.enrollments || [];
      setSubjects(enrollments.map((e: any) => e.subject).filter(Boolean));
      setAssignments(assignmentsRes.data || []);
      setMySubmissions(mySubmissionsRes || []);
      setError(null);
    } catch {
      setError('Failed to load assignments data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    if (!submissionContent.trim()) {
      toast.error('Please enter your submission text');
      return;
    }

    try {
      setSubmitting(true);
      await assignmentsApi.submit(selectedAssignment.id, { content: submissionContent });
      toast.success('Assignment submitted successfully');
      setSelectedAssignment(null);
      setSubmissionContent('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  // Filter assignments by subject
  const filteredAssignments = assignments.filter((a: any) => {
    const matchSubject = activeSubjectId === 'all' || a.subjectId === activeSubjectId;
    return matchSubject;
  });

  // Split into pending vs submitted
  const submittedAssignmentIds = mySubmissions.map((s: any) => s.assignmentId);
  
  const pendingAssignments = filteredAssignments.filter((a: any) => !submittedAssignmentIds.includes(a.id));
  const submittedAssignments = mySubmissions.filter((s: any) => {
    const matchSubject = activeSubjectId === 'all' || s.assignment?.subjectId === activeSubjectId || s.assignment?.subject?.id === activeSubjectId;
    return matchSubject;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="info">Submitted</Badge>;
      case 'LATE':
        return <Badge variant="danger">Late</Badge>;
      case 'REVIEWED':
        return <Badge variant="success">Graded</Badge>;
      case 'RETURNED':
        return <Badge variant="warning">Returned</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button if subject is selected */}
      {subjectIdParam && (
        <button
          onClick={() => navigate('/student/subjects')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Subjects
        </button>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 md:p-8 text-white shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-orange-100" />
            My Assignments
          </h1>
          <p className="text-orange-100 mt-2 text-sm md:text-base">
            View instructions, deadlines, submit your work, and read teacher feedback.
          </p>
        </div>
        <div className="hidden sm:block">
          <Calendar className="w-16 h-16 text-orange-200/50" />
        </div>
      </div>

      {/* Filter Tabs & Selectors */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        {/* Subject Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:inline">
            Subject:
          </span>
          <select
            value={activeSubjectId}
            onChange={(e) => setActiveSubjectId(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Tab Buttons */}
        <div className="flex p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 sm:flex-initial px-6 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'pending'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            To Do ({pendingAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            className={`flex-1 sm:flex-initial px-6 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'submitted'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Submitted ({submittedAssignments.length})
          </button>
        </div>
      </div>

      {/* Main List */}
      {activeTab === 'pending' ? (
        pendingAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingAssignments.map((a: any) => (
              <Card key={a.id} className="border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-orange-50 text-orange-600">
                      {a.subject?.name}
                    </span>
                    <Badge variant="warning" size="sm">
                      Max Marks: {a.totalMarks}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    {a.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                    {a.instructions || 'No special instructions provided.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                    <Calendar className="w-4 h-4" />
                    Due: {new Date(a.dueDate).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => setSelectedAssignment(a)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
                  >
                    Submit Work
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
            <h3 className="text-lg font-bold text-gray-800">All caught up! 🎉</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              You have no pending assignments due for submission at this moment.
            </p>
          </Card>
        )
      ) : (
        submittedAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submittedAssignments.map((sub: any) => (
              <Card key={sub.id} className="border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-600">
                      {sub.assignment?.subject?.name || 'Subject'}
                    </span>
                    {getStatusBadge(sub.status)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    {sub.assignment?.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted on: {new Date(sub.submittedAt).toLocaleDateString()}
                  </p>
                  
                  {sub.status === 'REVIEWED' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between text-green-800">
                      <span className="text-xs font-bold">Grade / Score:</span>
                      <span className="text-sm font-black">{sub.marks} / {sub.assignment?.totalMarks || 50}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-end">
                  <button
                    onClick={() => setViewingSubmission(sub)}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 transition-colors"
                  >
                    View Details & Feedback
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <HelpCircle className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No submissions found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              You haven't submitted any assignments for this filter yet.
            </p>
          </Card>
        )
      )}

      {/* Submission Form Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title={`Submit Assignment: ${selectedAssignment.title}`}
        >
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Instructions:
              </p>
              <p>{selectedAssignment.instructions || 'Show all working and write your answers clearly in the text box below.'}</p>
              <p className="font-semibold mt-1">Maximum Marks: {selectedAssignment.totalMarks} • Due Date: {new Date(selectedAssignment.dueDate).toLocaleString()}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                Write your response / answer details:
              </label>
              <textarea
                rows={8}
                required
                placeholder="Type your complete solution or paste links to your documents here..."
                className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedAssignment(null);
                  setSubmissionContent('');
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Graded Details Modal */}
      {viewingSubmission && (
        <Modal
          isOpen={!!viewingSubmission}
          onClose={() => setViewingSubmission(null)}
          title={`Submission Details: ${viewingSubmission.assignment?.title}`}
        >
          <div className="space-y-4 max-w-xl">
            {/* Meta */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <p className="text-xs text-gray-400">Submission Status:</p>
                <div className="mt-1">{getStatusBadge(viewingSubmission.status)}</div>
              </div>
              {viewingSubmission.status === 'REVIEWED' && (
                <div className="text-right">
                  <p className="text-xs text-gray-400">Score:</p>
                  <p className="text-lg font-black text-green-600 mt-1">
                    {viewingSubmission.marks} / {viewingSubmission.assignment?.totalMarks || 50}
                  </p>
                </div>
              )}
            </div>

            {/* Answer Content */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-gray-700">My Submitted Work:</h4>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 text-sm text-gray-700 whitespace-pre-wrap max-h-[160px] overflow-y-auto">
                {viewingSubmission.content || 'No text content provided.'}
              </div>
            </div>

            {/* Teacher Feedback */}
            {viewingSubmission.status === 'REVIEWED' ? (
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl space-y-1">
                <h4 className="text-xs font-bold text-green-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Teacher Feedback:
                </h4>
                <p className="text-xs text-green-700 leading-relaxed italic">
                  "{viewingSubmission.feedback || 'Excellent work! Keep it up.'}"
                </p>
                {viewingSubmission.reviewedAt && (
                  <p className="text-[10px] text-green-500 mt-2">
                    Graded on: {new Date(viewingSubmission.reviewedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed italic">
                Your submission is currently pending grading. Once the teacher reviews it, your score and feedback will appear here.
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => setViewingSubmission(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

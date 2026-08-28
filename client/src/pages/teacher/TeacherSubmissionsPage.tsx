import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { assignmentsApi } from '../../api/assignments.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/forms/FormField';
import { FileText, ArrowLeft, CheckCircle2, User, Award, Clock, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherSubmissionsPage() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Grade Modal State
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [gradingMarks, setGradingMarks] = useState<number>(0);
  const [gradingFeedback, setGradingFeedback] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!assignmentId) {
      setError('No assignment ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [assignmentData, submissionsRes] = await Promise.all([
        assignmentsApi.getById(assignmentId),
        assignmentsApi.getSubmissions(assignmentId)
      ]);

      setAssignment(assignmentData);
      setSubmissions(submissionsRes.data || []);
      setError(null);
    } catch {
      setError('Failed to load submissions list');
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenGradeModal = (sub: any) => {
    setGradingSubmission(sub);
    setGradingMarks(sub.marks || 0);
    setGradingFeedback(sub.feedback || '');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    if (gradingMarks < 0 || gradingMarks > assignment.totalMarks) {
      toast.error(`Marks must be between 0 and ${assignment.totalMarks}`);
      return;
    }

    try {
      setSaving(true);
      await assignmentsApi.reviewSubmission(gradingSubmission.id, {
        marks: Number(gradingMarks),
        feedback: gradingFeedback,
        status: 'REVIEWED'
      });
      toast.success('Submission graded successfully!');
      setGradingSubmission(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!assignment) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="info">Pending Review</Badge>;
      case 'LATE':
        return <Badge variant="danger">Late</Badge>;
      case 'REVIEWED':
        return <Badge variant="success">Graded</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/teacher/assignments')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Assignments
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider bg-indigo-750/50 px-2.5 py-1 rounded-full">
          {assignment.subject?.name} • Class: {assignment.class?.name}
        </span>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          Submissions for: {assignment.title}
        </h1>
        <p className="text-indigo-100 mt-1 text-sm">
          Instructions: {assignment.instructions || 'Review solutions, assign marks, and write constructive feedback.'}
        </p>
      </div>

      {/* Stats Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 border border-gray-150">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Total Submissions</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{submissions.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border border-gray-150">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Pending Grading</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">
              {submissions.filter(s => s.status === 'SUBMITTED').length}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border border-gray-150">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Graded</p>
            <p className="text-2xl font-black text-green-600 mt-0.5">
              {submissions.filter(s => s.status === 'REVIEWED').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Submissions List */}
      <Card className="p-0 border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Student Submission Log</h3>
          <span className="text-xs text-gray-400 font-medium">
            Total Class Capacity: {assignment.class?.capacity || 'N/A'}
          </span>
        </div>

        {submissions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {submissions.map((sub: any) => {
              const studentName = `${sub.student?.user?.firstName} ${sub.student?.user?.lastName}`;
              
              return (
                <div key={sub.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-50 text-gray-400 rounded-full border border-gray-100">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{studentName}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Submitted: {new Date(sub.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-auto">
                    {/* Status */}
                    <div>{getStatusBadge(sub.status)}</div>

                    {/* Score */}
                    {sub.status === 'REVIEWED' ? (
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Score</span>
                        <span className="text-sm font-black text-gray-700">
                          {sub.marks} / {assignment.totalMarks}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">Not graded</div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleOpenGradeModal(sub)}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                    >
                      {sub.status === 'REVIEWED' ? 'Edit Grade' : 'Grade Solution'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <HelpCircle className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No submissions yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              None of the enrolled students in Class {assignment.class?.name} have uploaded their solutions to this assignment yet.
            </p>
          </div>
        )}
      </Card>

      {/* Grading Review Modal */}
      {gradingSubmission && (
        <Modal
          isOpen={!!gradingSubmission}
          onClose={() => setGradingSubmission(null)}
          title={`Grade Submission: ${gradingSubmission.student?.user?.firstName} ${gradingSubmission.student?.user?.lastName}`}
        >
          <form onSubmit={handleSaveGrade} className="space-y-4 max-w-xl">
            {/* Student's answer content */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-gray-700">Student's Submitted Solution:</h4>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap max-h-[220px] overflow-y-auto">
                {gradingSubmission.content || 'No text content provided.'}
              </div>
            </div>

            {/* Score inputs */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
              <FormField label={`Marks Awarded (Max: ${assignment.totalMarks})`} required>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                  value={gradingMarks}
                  onChange={(e) => setGradingMarks(Number(e.target.value))}
                  required
                />
              </FormField>
              
              <div className="flex flex-col justify-end text-right pb-1.5 text-xs text-gray-400">
                <span>Subject: {assignment.subject?.name}</span>
                <span className="font-semibold text-gray-500 mt-0.5">Class: {assignment.class?.name}</span>
              </div>
            </div>

            {/* Feedback input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Grade Feedback</label>
              <textarea
                rows={4}
                placeholder="Write constructive notes or guidance for the student..."
                value={gradingFeedback}
                onChange={(e) => setGradingFeedback(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => setGradingSubmission(null)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Submit Evaluation'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

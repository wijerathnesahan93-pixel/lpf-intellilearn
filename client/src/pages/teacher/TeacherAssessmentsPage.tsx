import React, { useState, useEffect, useCallback } from 'react';
import { assessmentsApi } from '../../api/assessments.api';
import { dashboardApi } from '../../api/dashboard.api';
import { questionsApi } from '../../api/questions.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/forms/FormField';
import { Plus, Pencil, Trash2, ClipboardCheck, Clock, Award, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherAssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
  const [subjectQuestions, setSubjectQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    type: 'QUIZ',
    subjectId: '',
    classId: '',
    duration: 30, // minutes
    maxAttempts: 3,
    availableFrom: '',
    availableTo: '',
    isPublished: true,
    selectedQuestionIds: [] as string[]
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dbRes, assessmentsRes] = await Promise.all([
        dashboardApi.getDashboard(),
        assessmentsApi.list({ page: 1, limit: 100 })
      ]);

      setAssignedSubjects(dbRes.assignedSubjects || []);
      setAssessments(assessmentsRes.data || []);
      setError(null);
    } catch {
      setError('Failed to load assessments data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load questions for the selected subject when form subject changes
  useEffect(() => {
    const loadSubjectQuestions = async () => {
      if (!formData.subjectId) {
        setSubjectQuestions([]);
        return;
      }
      try {
        const res = await questionsApi.list({ subjectId: formData.subjectId, limit: 100 });
        setSubjectQuestions(res.data || []);
      } catch {
        toast.error('Failed to load questions list for selected subject');
      }
    };
    loadSubjectQuestions();
  }, [formData.subjectId]);

  const handleOpenModal = async (item?: any) => {
    if (item) {
      setEditingAssessment(item);
      
      // Fetch full assessment detail to get questions selected
      try {
        setLoading(true);
        const detailed = await assessmentsApi.getById(item.id);
        const selQuestionIds = detailed.questions?.map((q: any) => q.questionId) || [];
        
        setFormData({
          title: detailed.title,
          instructions: detailed.instructions || '',
          type: detailed.type,
          subjectId: detailed.subjectId,
          classId: detailed.classId || '',
          duration: detailed.duration,
          maxAttempts: detailed.maxAttempts,
          availableFrom: detailed.availableFrom ? detailed.availableFrom.split('T')[0] : '',
          availableTo: detailed.availableTo ? detailed.availableTo.split('T')[0] : '',
          isPublished: detailed.isPublished,
          selectedQuestionIds: selQuestionIds
        });
      } catch {
        toast.error('Failed to load assessment questions selection');
      } finally {
        setLoading(false);
      }
    } else {
      setEditingAssessment(null);
      const defaultAssign = assignedSubjects[0];
      setFormData({
        title: '',
        instructions: '',
        type: 'QUIZ',
        subjectId: defaultAssign ? defaultAssign.subjectId : '',
        classId: defaultAssign ? defaultAssign.classId : '',
        duration: 30,
        maxAttempts: 3,
        availableFrom: '',
        availableTo: '',
        isPublished: true,
        selectedQuestionIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCheckboxChange = (qId: string) => {
    setFormData((prev) => {
      const alreadySelected = prev.selectedQuestionIds.includes(qId);
      const updated = alreadySelected
        ? prev.selectedQuestionIds.filter(id => id !== qId)
        : [...prev.selectedQuestionIds, qId];
      return {
        ...prev,
        selectedQuestionIds: updated
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.classId) {
      toast.error('Please assign a subject and class');
      return;
    }
    if (formData.selectedQuestionIds.length === 0) {
      toast.error('Please select at least one question for the assessment');
      return;
    }

    // Format questions payload
    // Backend expects questionIds: Array of { questionId, marks, orderIndex }
    const questionsPayload = formData.selectedQuestionIds.map((qId, index) => {
      const qObj = subjectQuestions.find(q => q.id === qId);
      return {
        questionId: qId,
        marks: qObj ? qObj.marks : 5,
        orderIndex: index + 1
      };
    });

    const payload: any = {
      title: formData.title,
      instructions: formData.instructions,
      type: formData.type,
      subjectId: formData.subjectId,
      classId: formData.classId,
      duration: Number(formData.duration),
      maxAttempts: Number(formData.maxAttempts),
      isPublished: formData.isPublished,
      questionIds: questionsPayload
    };

    if (formData.availableFrom) payload.availableFrom = new Date(formData.availableFrom).toISOString();
    if (formData.availableTo) payload.availableTo = new Date(formData.availableTo).toISOString();

    try {
      setLoading(true);
      if (editingAssessment) {
        await assessmentsApi.update(editingAssessment.id, payload);
        toast.success('Assessment updated successfully');
      } else {
        await assessmentsApi.create(payload);
        toast.success('Assessment scheduled successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to save assessment');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment? All student results for this quiz will be deleted.')) return;
    try {
      setLoading(true);
      await assessmentsApi.delete(id);
      toast.success('Assessment deleted successfully');
      fetchData();
    } catch {
      toast.error('Failed to delete assessment');
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-purple-100" />
            Assessments Manager
          </h1>
          <p className="text-purple-100 mt-2 text-sm md:text-base">
            Create quizzes, tests, mock papers, choose questions from the bank, and view grades.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-purple-50 text-indigo-700 text-sm font-bold rounded-xl shadow-md transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Schedule Assessment
        </button>
      </div>

      {/* Grid listing assessments */}
      {assessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((ass: any) => (
            <Card key={ass.id} className="border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-600">
                      {ass.subject?.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gray-50 text-gray-500">
                      Class: {ass.class?.name || 'All'}
                    </span>
                  </div>
                  <Badge variant={ass.isPublished ? 'success' : 'default'} size="sm">
                    {ass.isPublished ? 'Active' : 'Draft'}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  {ass.title}
                </h3>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    Duration: {ass.duration} mins
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-500" />
                    Max Marks: {ass.totalMarks}
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                    Questions: {ass._count?.questions || 0} items
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-end gap-1">
                <button
                  onClick={() => handleOpenModal(ass)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit Assessment"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ass.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Assessment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center flex flex-col items-center">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Assessments Scheduled</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Schedule mock exams, tests, or past papers and map questions from your bank to publish them.
          </p>
        </Card>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAssessment ? 'Edit Assessment Settings' : 'Schedule Assessment'}
        >
          <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
            <FormField label="Assessment Title" required>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Chapter 1 Algebra Quiz"
              />
            </FormField>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Subject & Class</label>
                <select
                  required
                  value={`${formData.subjectId}:${formData.classId}`}
                  onChange={(e) => {
                    const [subId, clsId] = e.target.value.split(':');
                    setFormData({ ...formData, subjectId: subId || '', classId: clsId || '', selectedQuestionIds: [] });
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Subject/Class</option>
                  {assignedSubjects.map((item: any) => (
                    <option key={item.id} value={`${item.subjectId}:${item.classId}`}>
                      {item.class?.name} - {item.subject?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Assessment Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                >
                  <option value="QUIZ">Quiz</option>
                  <option value="PRACTICE_TEST">Practice Test</option>
                  <option value="MODEL_PAPER">Model Paper</option>
                  <option value="PAST_PAPER">Past Paper</option>
                  <option value="MOCK_EXAM">Mock Exam</option>
                </select>
              </div>

              <FormField label="Duration (minutes)" required>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Max Attempts Allowed" required>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData({ ...formData, maxAttempts: Number(e.target.value) })}
                  required
                />
              </FormField>

              <div className="flex flex-col gap-1.5 justify-end pb-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  Publish Assessment Immediately
                </label>
              </div>
            </div>

            {/* Questions Selection Drawer */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/30 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 uppercase">
                <span>Select questions from bank:</span>
                <span className="text-indigo-600">
                  Selected: {formData.selectedQuestionIds.length} items
                </span>
              </div>
              
              {formData.subjectId ? (
                subjectQuestions.length > 0 ? (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {subjectQuestions.map((q) => (
                      <label 
                        key={q.id} 
                        className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 transition-colors cursor-pointer text-xs leading-normal select-none"
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedQuestionIds.includes(q.id)}
                          onChange={() => handleCheckboxChange(q.id)}
                          className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="flex-1 space-y-1">
                          <p className="font-bold text-gray-800">{q.text}</p>
                          <p className="text-[10px] text-gray-400">
                            Topic: {q.topic?.name} • Difficulty: {q.difficulty} • Marks: {q.marks}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    No questions created for this subject. Create questions in the Questions Bank tab first!
                  </p>
                )
              ) : (
                <p className="text-xs text-gray-400 italic py-4 text-center">
                  Please select a Class & Subject above to load the matching question bank.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
              >
                {editingAssessment ? 'Save Settings' : 'Schedule Assessment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

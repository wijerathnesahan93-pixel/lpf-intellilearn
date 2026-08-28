import React, { useState, useEffect, useCallback } from 'react';
import { questionsApi } from '../../api/questions.api';
import { dashboardApi } from '../../api/dashboard.api';
import { topicsApi } from '../../api/topics.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/forms/FormField';
import { Plus, Pencil, Trash2, HelpCircle, Check, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subject/Topic mapping states
  const [subjectId, setSubjectId] = useState<string>('');
  const [topics, setTopics] = useState<any[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    text: '',
    type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'TRUE_FALSE',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD',
    marks: 5,
    correctAnswer: 'A',
    explanation: '',
    subjectId: '',
    topicId: '',
    options: [
      { label: 'A', text: '' },
      { label: 'B', text: '' },
      { label: 'C', text: '' },
      { label: 'D', text: '' }
    ]
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dbRes, questionsRes] = await Promise.all([
        dashboardApi.getDashboard(),
        questionsApi.list({ page: 1, limit: 100 })
      ]);

      const subList = dbRes.assignedSubjects || [];
      setAssignedSubjects(subList);
      setQuestions(questionsRes.data || []);
      setError(null);
    } catch {
      setError('Failed to load question bank data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch topics when subject selection changes
  useEffect(() => {
    const loadTopics = async () => {
      if (!formData.subjectId) {
        setTopics([]);
        return;
      }
      try {
        const res = await topicsApi.list({ subjectId: formData.subjectId, limit: 100 });
        setTopics(res.data || []);
      } catch {
        toast.error('Failed to load topics for this subject');
      }
    };
    loadTopics();
  }, [formData.subjectId]);

  const handleOpenModal = async (item?: any) => {
    if (item) {
      setEditingItem(item);
      
      // Fetch full question detail first to get options
      try {
        setLoading(true);
        const detailedQuestion = await questionsApi.getById(item.id);
        
        // If type is TRUE_FALSE, options can be empty or custom
        const opts = detailedQuestion.options?.length > 0 
          ? detailedQuestion.options.map((o: any) => ({ label: o.label, text: o.text }))
          : [
              { label: 'A', text: '' },
              { label: 'B', text: '' },
              { label: 'C', text: '' },
              { label: 'D', text: '' }
            ];

        setFormData({
          text: detailedQuestion.text,
          type: detailedQuestion.type,
          difficulty: detailedQuestion.difficulty,
          marks: detailedQuestion.marks,
          correctAnswer: detailedQuestion.correctAnswer,
          explanation: detailedQuestion.explanation || '',
          subjectId: detailedQuestion.subjectId,
          topicId: detailedQuestion.topicId,
          options: opts
        });
      } catch {
        toast.error('Failed to load question options');
      } finally {
        setLoading(false);
      }
    } else {
      setEditingItem(null);
      const defaultAssign = assignedSubjects[0];
      setFormData({
        text: '',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        marks: 5,
        correctAnswer: 'A',
        explanation: '',
        subjectId: defaultAssign ? defaultAssign.subjectId : '',
        topicId: '',
        options: [
          { label: 'A', text: '' },
          { label: 'B', text: '' },
          { label: 'C', text: '' },
          { label: 'D', text: '' }
        ]
      });
    }
    setIsModalOpen(true);
  };

  const handleOptionChange = (idx: number, textVal: string) => {
    const updated = [...formData.options];
    updated[idx].text = textVal;
    setFormData({ ...formData, options: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.topicId) {
      toast.error('Please assign a subject and topic');
      return;
    }

    // Format options payload
    const isMc = formData.type === 'MULTIPLE_CHOICE';
    
    // Check options are filled
    if (isMc) {
      const unfilled = formData.options.some(o => !o.text.trim());
      if (unfilled) {
        toast.error('Please fill in text for all options (A, B, C, D)');
        return;
      }
    }

    const payload: any = {
      text: formData.text,
      type: formData.type,
      difficulty: formData.difficulty,
      marks: Number(formData.marks),
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation,
      subjectId: formData.subjectId,
      topicId: formData.topicId,
    };

    if (isMc) {
      payload.options = formData.options.map(o => ({
        label: o.label,
        text: o.text,
        isCorrect: o.label === formData.correctAnswer
      }));
    }

    try {
      setLoading(true);
      if (editingItem) {
        await questionsApi.update(editingItem.id, payload);
        toast.success('Question updated in bank');
      } else {
        await questionsApi.create(payload);
        toast.success('Question added to bank');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to save question');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question? It will be removed from all future assessment configurations.')) return;
    try {
      setLoading(true);
      await questionsApi.delete(id);
      toast.success('Question deleted successfully');
      fetchData();
    } catch {
      toast.error('Failed to delete question');
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-500 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-teal-100" />
            Questions Bank
          </h1>
          <p className="text-teal-100 mt-2 text-sm md:text-base">
            Manage your question bank, categorise by difficulty/topics, and prepare assessments.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-teal-50 text-teal-700 text-sm font-bold rounded-xl shadow-md transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Questions list */}
      {questions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {questions.map((q: any) => (
            <Card key={q.id} className="border border-gray-100 flex flex-col justify-between hover:shadow-sm transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                    <span className="px-2.5 py-0.5 rounded bg-teal-50 text-teal-600">
                      {q.subject?.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-gray-50 text-gray-500">
                      Topic: {q.topic?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{q.difficulty}</Badge>
                    <span className="text-xs font-bold text-gray-400">Marks: {q.marks}</span>
                  </div>
                </div>

                <h3 className="text-sm md:text-base font-bold text-gray-800 leading-relaxed">
                  {q.text}
                </h3>
                
                <div className="text-xs font-bold text-teal-600 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100/50 flex items-center gap-1.5 w-fit">
                  <Check className="w-4 h-4 text-teal-500" />
                  Correct Answer: Option {q.correctAnswer}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-end gap-1">
                <button
                  onClick={() => handleOpenModal(q)}
                  className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title="Edit Question"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center flex flex-col items-center">
          <HelpCircle className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">Your Bank is Empty</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Add multiple-choice or true/false questions to build your active question repository.
          </p>
        </Card>
      )}

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? 'Edit Question' : 'Add Question to Bank'}
        >
          <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
            {/* Question Text */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Question Text</label>
              <textarea
                rows={3}
                required
                placeholder="Type your question statement here..."
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Subject/Topic mapping */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Subject</label>
                <select
                  required
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value, topicId: '' })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Subject</option>
                  {assignedSubjects.map((item: any) => (
                    <option key={item.id} value={item.subjectId}>
                      {item.subject?.name} ({item.class?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Topic</label>
                <select
                  required
                  disabled={!formData.subjectId}
                  value={formData.topicId}
                  onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="">Select Topic</option>
                  {topics.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type, Difficulty, Marks */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Question Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const typeVal = e.target.value as 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
                    const correctAns = typeVal === 'TRUE_FALSE' ? 'TRUE' : 'A';
                    setFormData({ ...formData, type: typeVal, correctAnswer: correctAns });
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <FormField label="Marks" required>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                  required
                />
              </FormField>
            </div>

            {/* Options Input based on type */}
            {formData.type === 'TRUE_FALSE' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Correct Answer</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                    <input
                      type="radio"
                      name="tfAnswer"
                      checked={formData.correctAnswer === 'TRUE'}
                      onChange={() => setFormData({ ...formData, correctAnswer: 'TRUE' })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    True
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                    <input
                      type="radio"
                      name="tfAnswer"
                      checked={formData.correctAnswer === 'FALSE'}
                      onChange={() => setFormData({ ...formData, correctAnswer: 'FALSE' })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    False
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 block">Options Config</label>
                <div className="grid grid-cols-2 gap-4">
                  {formData.options.map((opt, index) => (
                    <div key={opt.label} className="flex items-center gap-2 border border-gray-200 p-2.5 rounded-xl bg-white focus-within:border-indigo-500 transition-colors">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-indigo-600 shrink-0">
                        <input
                          type="radio"
                          name="mcCorrect"
                          checked={formData.correctAnswer === opt.label}
                          onChange={() => setFormData({ ...formData, correctAnswer: opt.label })}
                          className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500"
                        />
                        {opt.label}:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${opt.label} text`}
                        value={opt.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="w-full text-xs text-gray-700 bg-transparent outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Answer Explanation */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Answer Explanation (Optional)</label>
              <textarea
                rows={2}
                placeholder="Write why this option is correct (helpful study feedback for students)..."
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Submit Actions */}
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
                {editingItem ? 'Save Question' : 'Add to Bank'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

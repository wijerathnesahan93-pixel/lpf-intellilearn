import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentsApi } from '../../api/assignments.api';
import { dashboardApi } from '../../api/dashboard.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/forms/FormField';
import { Plus, Pencil, Trash2, Calendar, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherAssignmentsPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    subjectId: '',
    classId: '',
    totalMarks: 50,
    dueDate: '',
    isPublished: true
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dbRes, assignmentsRes] = await Promise.all([
        dashboardApi.getDashboard(),
        assignmentsApi.list({ page: 1, limit: 100 })
      ]);

      setAssignedSubjects(dbRes.assignedSubjects || []);
      setAssignments(assignmentsRes.data || []);
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

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingAssignment(item);
      setFormData({
        title: item.title,
        instructions: item.instructions || '',
        subjectId: item.subjectId,
        classId: item.classId,
        totalMarks: item.totalMarks,
        dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
        isPublished: item.isPublished
      });
    } else {
      setEditingAssignment(null);
      // Select first assigned subject/class by default if any
      const defaultAssign = assignedSubjects[0];
      setFormData({
        title: '',
        instructions: '',
        subjectId: defaultAssign ? defaultAssign.subjectId : '',
        classId: defaultAssign ? defaultAssign.classId : '',
        totalMarks: 50,
        dueDate: '',
        isPublished: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.classId) {
      toast.error('Please assign a subject and class');
      return;
    }

    try {
      setLoading(true);
      // Format totalMarks to number, and format dueDate
      const payload = {
        ...formData,
        totalMarks: Number(formData.totalMarks),
        dueDate: new Date(formData.dueDate).toISOString()
      };

      if (editingAssignment) {
        await assignmentsApi.update(editingAssignment.id, payload);
        toast.success('Assignment updated successfully');
      } else {
        await assignmentsApi.create(payload);
        toast.success('Assignment created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to save assignment');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment permanently?')) return;
    try {
      setLoading(true);
      await assignmentsApi.delete(id);
      toast.success('Assignment deleted successfully');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete assignment');
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-100" />
            Class Assignments
          </h1>
          <p className="text-indigo-100 mt-2 text-sm md:text-base">
            Create, publish, modify assignments, and grade student submissions.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl shadow-md transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      {/* Grid listing assignments */}
      {assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a: any) => (
            <Card key={a.id} className="border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-600">
                      {a.subject?.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700">
                      Class: {a.class?.name}
                    </span>
                  </div>
                  <Badge variant={a.isPublished ? 'success' : 'default'} size="sm">
                    {a.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  {a.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Total Marks: {a.totalMarks} • Due Date: {new Date(a.dueDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 mt-3 line-clamp-3">
                  {a.instructions || 'No instructions provided.'}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(a)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Assignment"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/teacher/submissions?assignmentId=${a.id}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold rounded-xl transition-all"
                >
                  Grade Submissions
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center flex flex-col items-center">
          <FileText className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Assignments Created</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            You haven't created any assignments yet. Click the "Create Assignment" button to schedule your first one.
          </p>
        </Card>
      )}

      {/* Creation / Editing Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
        >
          <form onSubmit={handleSave} className="space-y-4 max-w-xl">
            <FormField label="Assignment Title" required>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Algebra Assignment 1"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Subject & Class</label>
                <select
                  required
                  value={`${formData.subjectId}:${formData.classId}`}
                  onChange={(e) => {
                    const [subId, clsId] = e.target.value.split(':');
                    setFormData({ ...formData, subjectId: subId || '', classId: clsId || '' });
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Class & Subject</option>
                  {assignedSubjects.map((item: any) => (
                    <option key={item.id} value={`${item.subjectId}:${item.classId}`}>
                      {item.class?.name} - {item.subject?.name}
                    </option>
                  ))}
                </select>
              </div>

              <FormField label="Maximum Marks" required>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Due Date" required>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                  Publish Assignment Immediately
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Instructions</label>
              <textarea
                rows={4}
                placeholder="Describe what the students need to do..."
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:border-indigo-500"
              />
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
                {editingAssignment ? 'Save Changes' : 'Create Assignment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

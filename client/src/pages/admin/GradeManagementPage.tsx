import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Plus, Edit2, Trash2, X, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GradeManagementPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    number: 1,
    name: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/grades');
      setGrades(res.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch Grades data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const openCreateModal = () => {
    setEditingGrade(null);
    setFormData({ number: 1, name: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (grade: any) => {
    setEditingGrade(grade);
    setFormData({
      number: grade.number,
      name: grade.name,
      isActive: grade.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingGrade) {
        await apiClient.patch(`/admin/grades/${editingGrade.id}`, formData);
        toast.success('Grade updated successfully!');
      } else {
        await apiClient.post('/admin/grades', formData);
        toast.success('Grade created successfully!');
      }
      setIsModalOpen(false);
      fetchGrades();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to save Grade');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Grade? All associated classes might be affected.')) return;

    try {
      await apiClient.delete(`/admin/grades/${id}`);
      toast.success('Grade deleted successfully.');
      fetchGrades();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete Grade');
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchGrades} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-700" />
            Grade Management (Grades 1–13)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure default academic Grade structure.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white px-4 text-sm font-semibold transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Grade Level
        </button>
      </div>

      <Card>
        {grades.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No Grades Configured</h3>
            <p className="text-sm text-gray-500 mt-1">Click the button above to add your first Grade record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase bg-gray-50/50">
                  <th className="py-3 px-4">Grade Number</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {grades.map(grade => (
                  <tr key={grade.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-4 font-bold text-gray-900">
                      {grade.number}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-800">
                      {grade.name}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={grade.isActive ? 'success' : 'danger'}>
                        {grade.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(grade)}
                          className="p-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(grade.id)}
                          className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-gray-100">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-700" />
                {editingGrade ? 'Edit Grade Level' : 'Add Grade Level'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Grade Number (1–13) *</label>
                <input
                  type="number"
                  min="1"
                  max="13"
                  className="h-10 rounded-lg border border-gray-300 px-3 outline-none text-sm focus:border-purple-600"
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: parseInt(e.target.value, 10) }))}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Grade Name (e.g. Grade 10) *</label>
                <input
                  type="text"
                  className="h-10 rounded-lg border border-gray-300 px-3 outline-none text-sm focus:border-purple-600"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Grade 10"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 select-none">
                  Is Active / Enabled
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-10 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

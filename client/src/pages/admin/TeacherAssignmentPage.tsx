import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Plus, Trash2, UserCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherAssignmentPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [classSubjects, setClassSubjects] = useState<any[]>([]);

  // Selection states
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignRes, teacherRes, classRes] = await Promise.all([
        apiClient.get('/teacher-assignments?limit=100'),
        apiClient.get('/teachers?limit=100'),
        apiClient.get('/classes?limit=100')
      ]);
      setAssignments(assignRes.data.data || []);
      setTeachers(teacherRes.data.data?.items || teacherRes.data.items || []);
      setClasses(classRes.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch teacher assignments data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassSubjects = async (classId: string) => {
    if (!classId) {
      setClassSubjects([]);
      return;
    }
    try {
      const res = await apiClient.get(`/classes/${classId}/subjects`);
      setClassSubjects(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch subjects for selected class');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedClassId(val);
    setSelectedSubjectId('');
    fetchClassSubjects(val);
  };

  const openCreateModal = () => {
    setSelectedTeacherId('');
    setSelectedClassId('');
    setSelectedSubjectId('');
    setClassSubjects([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId || !selectedClassId || !selectedSubjectId) {
      toast.error('Please fill in all assignment fields');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/teacher-assignments', {
        teacherId: selectedTeacherId,
        classId: selectedClassId,
        subjectId: selectedSubjectId
      });
      toast.success('Teacher assigned successfully!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to create teacher assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this teacher assignment?')) return;

    try {
      await apiClient.delete(`/teacher-assignments/${id}`);
      toast.success('Assignment removed successfully.');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to remove assignment');
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-700" />
            Teacher Class Assignments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Assign academic teachers to specific Class and Subject combinations.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white px-4 text-sm font-semibold transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Assign Teacher
        </button>
      </div>

      <Card>
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No Teacher Assignments</h3>
            <p className="text-sm text-gray-500 mt-1">Click the button above to assign a teacher to a class/subject.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase bg-gray-50/50">
                  <th className="py-3 px-4">Teacher</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {assignments.map(ass => (
                  <tr key={ass.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-4 font-bold text-gray-900">
                      {ass.teacher?.user?.firstName} {ass.teacher?.user?.lastName}
                      <p className="text-xs text-gray-500 font-normal">Emp ID: {ass.teacher?.employeeId}</p>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-800">
                      {ass.class?.name}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="info">
                        {ass.subject?.name} ({ass.subject?.code})
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDelete(ass.id)}
                        className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-gray-100">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-700" />
                New Teacher Assignment
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
                <label className="text-xs font-bold text-gray-700">Select Teacher *</label>
                <select
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 outline-none text-sm focus:border-purple-600"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.user?.firstName} {t.user?.lastName} (ID: {t.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Select Class *</label>
                <select
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 outline-none text-sm focus:border-purple-600"
                  value={selectedClassId}
                  onChange={handleClassChange}
                  required
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.academicYear?.name})</option>
                  ))}
                </select>
              </div>

              {selectedClassId && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <label className="text-xs font-bold text-gray-700">Select Subject *</label>
                  <select
                    className="h-10 rounded-lg border border-gray-300 bg-white px-3 outline-none text-sm focus:border-purple-600"
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Subject --</option>
                    {classSubjects.map(cs => (
                      <option key={cs.id} value={cs.subject?.id}>{cs.subject?.name} ({cs.subject?.code})</option>
                    ))}
                  </select>
                  {classSubjects.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No subjects mapped to this class. Assign subjects to the class first.</p>
                  )}
                </div>
              )}

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
                  disabled={submitting || !selectedTeacherId || !selectedClassId || !selectedSubjectId}
                  className="flex-1 h-10 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

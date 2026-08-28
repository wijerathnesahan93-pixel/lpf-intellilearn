import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Plus, Trash2, BookOpen, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClassSubjectManagementPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [classRes, subjectRes] = await Promise.all([
        apiClient.get('/classes?limit=100'),
        apiClient.get('/subjects?limit=100')
      ]);
      setClasses(classRes.data.data || []);
      setAllSubjects(subjectRes.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch classes or subjects.');
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
      toast.error('Failed to load class subjects');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedClassId(val);
    fetchClassSubjects(val);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      toast.error('Please select a class first');
      return;
    }
    if (!selectedSubjectId) {
      toast.error('Please select a subject to add');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(`/classes/${selectedClassId}/subjects`, {
        subjectId: selectedSubjectId
      });
      toast.success('Subject added to class successfully!');
      setSelectedSubjectId('');
      fetchClassSubjects(selectedClassId);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to add subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveSubject = async (subjectId: string) => {
    if (!window.confirm('Are you sure you want to remove this subject from the class?')) return;

    try {
      await apiClient.delete(`/classes/${selectedClassId}/subjects/${subjectId}`);
      toast.success('Subject removed from class.');
      fetchClassSubjects(selectedClassId);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to remove subject');
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchInitialData} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-700" />
          Class-Subject Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Map academic subjects to specific class sections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Selector and Add Form */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Class Configuration</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Select Class *</label>
              <select
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 outline-none text-sm focus:border-purple-600"
                value={selectedClassId}
                onChange={handleClassChange}
              >
                <option value="">-- Choose Class --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.academicYear?.name})</option>
                ))}
              </select>
            </div>

            {selectedClassId && (
              <form onSubmit={handleAddSubject} className="space-y-4 border-t pt-4">
                <h4 className="text-xs font-bold text-purple-950">Add Subject to Class</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Select Subject *</label>
                  <select
                    className="h-10 rounded-lg border border-gray-300 bg-white px-3 outline-none text-sm focus:border-purple-600"
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                  >
                    <option value="">-- Choose Subject --</option>
                    {allSubjects
                      .filter(sub => !classSubjects.some(cs => cs.subjectId === sub.id))
                      .map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                      ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedSubjectId}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Subject
                </button>
              </form>
            )}
          </Card>
        </div>

        {/* Right column: Mapped Subjects list */}
        <div className="md:col-span-2">
          <Card>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Class Subject Mapping</h3>
            
            {!selectedClassId ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                <Layers className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                Select a class from the left panel to configure its active subjects.
              </div>
            ) : classSubjects.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                No subjects currently assigned to this class.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase bg-gray-50/50">
                      <th className="py-2.5 px-4">Subject Name</th>
                      <th className="py-2.5 px-4">Subject Code</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {classSubjects.map(cs => (
                      <tr key={cs.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-bold text-gray-800">
                          {cs.subject?.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {cs.subject?.code}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRemoveSubject(cs.subjectId)}
                            className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                            title="Remove Subject"
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
        </div>
      </div>
    </div>
  );
}

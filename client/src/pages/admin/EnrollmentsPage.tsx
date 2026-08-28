import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable } from '../../components/data/DataTable';
import { Pagination } from '../../components/data/Pagination';
import { FormField } from '../../components/forms/FormField';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { usePagination } from '../../hooks/usePagination';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { enrollmentsApi } from '../../api/enrollments.api';
import { studentsApi } from '../../api/students.api';
import { classesApi } from '../../api/classes.api';
import { subjectsApi } from '../../api/subjects.api';
import { Enrollment, Student, Class, Subject } from '../../types';

export function EnrollmentsPage() {
  const [data, setData] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Enrollment | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Enrollment | null>(null);
  
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [formData, setFormData] = useState({ studentId: '', classId: '', subjectId: '' });
  
  const { page, limit, total, setPage, setTotal } = usePagination();

  const fetchDependencies = async () => {
    try {
      const [stuRes, clsRes, subRes] = await Promise.all([
        studentsApi.list({ limit: 1000 }),
        classesApi.list({ limit: 100 }),
        subjectsApi.list({ limit: 100 })
      ]);
      setStudents(stuRes.data);
      setClasses(clsRes.data);
      setSubjects(subRes.data);
    } catch {
      toast.error('Failed to load dependencies');
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await enrollmentsApi.list({ page, limit, classId: classFilter, subjectId: subjectFilter });
      setData(result.data);
      setTotal(result.meta.total);
      setError(null);
    } catch {
      setError('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, [page, limit, classFilter, subjectFilter, setTotal]);

  useEffect(() => { 
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (item?: Enrollment) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        studentId: item.studentId,
        classId: item.classId || '',
        subjectId: item.subjectId || '',
      });
    } else {
      setEditingItem(null);
      setFormData({ studentId: '', classId: '', subjectId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { studentId: formData.studentId };
      if (formData.classId) payload.classId = formData.classId;
      if (formData.subjectId) payload.subjectId = formData.subjectId;
      
      if (editingItem) {
        await enrollmentsApi.update(editingItem.id, payload);
        toast.success('Updated successfully');
      } else {
        await enrollmentsApi.create(payload);
        toast.success('Created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await enrollmentsApi.delete(deletingItem.id);
      toast.success('Deleted successfully');
      setIsDeleteOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    { key: 'student', header: 'Student', render: (item: any) => `${item.student?.user?.firstName} ${item.student?.user?.lastName}` },
    { key: 'admissionNo', header: 'Admission No', render: (item: any) => item.student?.admissionNumber },
    { key: 'class', header: 'Class', render: (item: any) => item.class?.name || '-' },
    { key: 'subject', header: 'Subject', render: (item: any) => item.subject?.name || '-' },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Enrollment) => (
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => handleOpenModal(item)}><Pencil className="w-4 h-4" /></Button>
          <Button variant="secondary" size="sm" onClick={() => { setDeletingItem(item); setIsDeleteOpen(true); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </div>
      ),
    },
  ];

  if (loading && !data.length) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
        <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" /> Add New</Button>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <DataTable columns={columns} data={data} keyExtractor={(item) => item.id} />
        <div className="mt-4">
          <Pagination page={page} totalPages={Math.ceil(total / limit)} onPageChange={setPage} hasNextPage={page < Math.ceil(total / limit)} hasPrevPage={page > 1} />
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Enrollment' : 'Add Enrollment'}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Student" required>
            <select className="form-select w-full rounded-md border-gray-300" value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} required>
              <option value="">Select a student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.user?.firstName} {s.user?.lastName} ({s.admissionNumber})</option>
              ))}
            </select>
          </FormField>
          <FormField label="Class (Optional)">
            <select className="form-select w-full rounded-md border-gray-300" value={formData.classId} onChange={(e) => setFormData({...formData, classId: e.target.value})}>
              <option value="">Select a class...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Subject (Optional)">
            <select className="form-select w-full rounded-md border-gray-300" value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})}>
              <option value="">Select a subject...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Enrollment"
        message="Are you sure you want to delete this enrollment? This action cannot be undone."
        onConfirm={handleDelete}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}

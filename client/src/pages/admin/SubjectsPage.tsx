import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Plus, Pencil, Trash2, Search, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { subjectsApi } from '../../api/subjects.api';
import { coursesApi } from '../../api/courses.api';
import { Subject, Course } from '../../types';

export function SubjectsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Subject | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Subject | null>(null);
  
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', code: '', courseId: '' });
  
  const { page, limit, total, setPage, setTotal } = usePagination();

  const fetchDependencies = async () => {
    try {
      const res = await coursesApi.list({ limit: 100 });
      setCourses(res.data);
    } catch {
      toast.error('Failed to load courses');
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await subjectsApi.list({ page, limit, search });
      setData(result.data);
      setTotal(result.meta.total);
      setError(null);
    } catch {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, setTotal]);

  useEffect(() => { 
    fetchDependencies();
    fetchData(); 
  }, [fetchData]);

  const handleOpenModal = (item?: Subject) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        code: item.code,
        courseId: item.courseId,
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', code: '', courseId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await subjectsApi.update(editingItem.id, formData);
        toast.success('Updated successfully');
      } else {
        await subjectsApi.create(formData);
        toast.success('Created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await subjectsApi.delete(deletingItem.id);
      toast.success('Deleted successfully');
      setIsDeleteOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (item: any) => item.name },
    { key: 'code', header: 'Code', render: (item: any) => item.code },
    { key: 'course', header: 'Course', render: (item: any) => item.course?.name || '-' },
    { key: '_count', header: 'Topics', render: (item: any) => item._count?.topics || 0 },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Subject) => (
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/subjects/${item.id}/topics`)} title="View Topics"><List className="w-4 h-4 text-blue-500" /></Button>
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
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" /> Add New</Button>
      </div>

      <Card>
        <div className="mb-4 flex items-center">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <DataTable columns={columns} data={data} keyExtractor={(item) => item.id} />
        <div className="mt-4">
          <Pagination page={page} totalPages={Math.ceil(total / limit)} onPageChange={setPage} hasNextPage={page < Math.ceil(total / limit)} hasPrevPage={page > 1} />
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Subject' : 'Add Subject'}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Name" required>
            <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </FormField>
          <FormField label="Code" required>
            <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
          </FormField>
          <FormField label="Course" required>
            <select className="form-select w-full rounded-md border-gray-300" value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})} required>
              <option value="">Select a course...</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
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
        title="Delete Subject"
        message="Are you sure you want to delete this subject? This action cannot be undone."
        onConfirm={handleDelete}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}

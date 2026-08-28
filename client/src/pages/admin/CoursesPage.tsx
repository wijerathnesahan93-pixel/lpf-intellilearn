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
import { coursesApi } from '../../api/courses.api';
import { Course } from '../../types';

export function CoursesPage() {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Course | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Course | null>(null);
  
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  
  const { page, limit, total, setPage, setTotal } = usePagination();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await coursesApi.list({ page, limit, search });
      setData(result.data);
      setTotal(result.meta.total);
      setError(null);
    } catch {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, setTotal]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenModal = (item?: Course) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        code: item.code,
        description: item.description || '',
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', code: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await coursesApi.update(editingItem.id, formData);
        toast.success('Updated successfully');
      } else {
        await coursesApi.create(formData);
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
      await coursesApi.delete(deletingItem.id);
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
    { key: 'description', header: 'Description', render: (item: any) => item.description || '-' },
    { key: '_count', header: 'Subjects', render: (item: any) => item._count?.subjects || 0 },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Course) => (
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
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Course' : 'Add Course'}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Name" required>
            <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </FormField>
          <FormField label="Code" required>
            <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
          </FormField>
          <FormField label="Description">
            <textarea className="form-textarea w-full rounded-md border-gray-300" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
          </FormField>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        onConfirm={handleDelete}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}

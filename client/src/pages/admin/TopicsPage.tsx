import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { topicsApi } from '../../api/topics.api';
import { subjectsApi } from '../../api/subjects.api';
import { Topic, Subject } from '../../types';

export function TopicsPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [data, setData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Topic | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Topic | null>(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', orderIndex: 0 });
  
  const { page, limit, total, setPage, setTotal } = usePagination();

  const fetchData = useCallback(async () => {
    if (!subjectId) return;
    try {
      setLoading(true);
      const subRes = await subjectsApi.getById(subjectId);
      setSubject(subRes);
      
      const result = await topicsApi.list({ page, limit, subjectId });
      setData(result.data);
      setTotal(result.meta.total);
      setError(null);
    } catch {
      setError('Failed to load topics');
    } finally {
      setLoading(false);
    }
  }, [subjectId, page, limit, setTotal]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenModal = (item?: Topic) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        orderIndex: item.orderIndex,
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '', orderIndex: data.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;
    try {
      if (editingItem) {
        await topicsApi.update(editingItem.id, { ...formData, subjectId });
        toast.success('Updated successfully');
      } else {
        await topicsApi.create({ ...formData, subjectId });
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
      await topicsApi.delete(deletingItem.id);
      toast.success('Deleted successfully');
      setIsDeleteOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    { key: 'orderIndex', header: 'Order', render: (item: any) => item.orderIndex },
    { key: 'name', header: 'Title', render: (item: any) => item.name },
    { key: 'description', header: 'Description', render: (item: any) => item.description || '-' },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Topic) => (
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
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/subjects')} className="mr-4">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topics for {subject?.name}</h1>
          <p className="text-sm text-gray-500">{subject?.code}</p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" /> Add Topic</Button>
        </div>
      </div>

      <Card>
        <DataTable columns={columns} data={data} keyExtractor={(item) => item.id} />
        <div className="mt-4">
          <Pagination page={page} totalPages={Math.ceil(total / limit)} onPageChange={setPage} hasNextPage={page < Math.ceil(total / limit)} hasPrevPage={page > 1} />
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Topic' : 'Add Topic'}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Title" required>
            <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </FormField>
          <FormField label="Order Index" required>
            <input type="number" className="form-input w-full rounded-md border-gray-300" value={formData.orderIndex} onChange={(e) => setFormData({...formData, orderIndex: parseInt(e.target.value) || 0})} required />
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
        title="Delete Topic"
        message="Are you sure you want to delete this topic? This action cannot be undone."
        onConfirm={handleDelete}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}

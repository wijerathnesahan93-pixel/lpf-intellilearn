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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { systemConfigApi } from '../../api/system-configs.api';
import { SystemConfig } from '../../types';

export function SystemConfigPage() {
  const [data, setData] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SystemConfig | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<SystemConfig | null>(null);
  
  const [formData, setFormData] = useState({ key: '', value: '', description: '' });
  
  const { page, limit, total, setPage, setTotal } = usePagination();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await systemConfigApi.list({ page, limit });
      setData(result.data);
      setTotal(result.meta.total);
      setError(null);
    } catch {
      setError('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  }, [page, limit, setTotal]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenModal = (item?: SystemConfig) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        key: item.key,
        value: item.value,
        description: item.description || '',
      });
    } else {
      setEditingItem(null);
      setFormData({ key: '', value: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await systemConfigApi.update(editingItem.id, formData);
        toast.success('Updated successfully');
      } else {
        await systemConfigApi.create(formData);
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
      await systemConfigApi.delete(deletingItem.id);
      toast.success('Deleted successfully');
      setIsDeleteOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    { key: 'key', header: 'Key', render: (item: any) => item.key },
    { key: 'value', header: 'Value', render: (item: any) => item.value },
    { key: 'description', header: 'Description', render: (item: any) => item.description || '-' },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: SystemConfig) => (
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
        <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
        <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" /> Add Key</Button>
      </div>

      <Card>
        <DataTable columns={columns} data={data} keyExtractor={(item) => item.id} />
        <div className="mt-4">
          <Pagination page={page} totalPages={Math.ceil(total / limit)} onPageChange={setPage} hasNextPage={page < Math.ceil(total / limit)} hasPrevPage={page > 1} />
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Config' : 'Add Config'}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Key" required>
            <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.key} onChange={(e) => setFormData({...formData, key: e.target.value})} required disabled={!!editingItem} />
          </FormField>
          <FormField label="Value" required>
            <textarea className="form-textarea w-full rounded-md border-gray-300" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} required rows={3} />
          </FormField>
          <FormField label="Description">
            <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </FormField>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Config"
        message="Are you sure you want to delete this configuration? This might affect system behavior."
        onConfirm={handleDelete}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}

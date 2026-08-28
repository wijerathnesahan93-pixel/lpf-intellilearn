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
import { parentsApi } from '../../api/parents.api';
import { Parent } from '../../types';

export function ParentsPage() {
  const [data, setData] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Parent | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Parent | null>(null);
  
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ 
    user: { firstName: '', lastName: '', email: '', password: '', phone: '' },
    occupation: '', 
    address: '' 
  });
  
  const { page, limit, total, setPage, setTotal } = usePagination();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await parentsApi.list({ page, limit, search });
      setData(result.data);
      setTotal(result.meta.total);
      setError(null);
    } catch {
      setError('Failed to load parents');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, setTotal]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenModal = (item?: Parent) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        user: { 
          firstName: item.user?.firstName || '', 
          lastName: item.user?.lastName || '', 
          email: item.user?.email || '', 
          password: '', 
          phone: item.phone || '' 
        },
        occupation: item.occupation || '',
        address: item.address || '',
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        user: { firstName: '', lastName: '', email: '', password: '', phone: '' },
        occupation: '', address: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const updateData: any = { ...formData };
        if (!updateData.user.password) {
          delete updateData.user.password;
        }
        await parentsApi.update(editingItem.id, updateData);
        toast.success('Updated successfully');
      } else {
        await parentsApi.create(formData);
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
      await parentsApi.delete(deletingItem.id);
      toast.success('Deleted successfully');
      setIsDeleteOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (item: any) => `${item.user?.firstName} ${item.user?.lastName}` },
    { key: 'email', header: 'Email', render: (item: any) => item.user?.email },
    { key: 'phone', header: 'Phone', render: (item: any) => item.user?.phone || '-' },
    { key: 'occupation', header: 'Occupation', render: (item: any) => item.occupation || '-' },
    { key: 'children', header: 'Children', render: (item: any) => item.students?.length || 0 },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Parent) => (
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
        <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
        <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" /> Add New</Button>
      </div>

      <Card>
        <div className="mb-4 flex items-center">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search parents..."
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Parent' : 'Add Parent'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.user.firstName} onChange={(e) => setFormData({...formData, user: {...formData.user, firstName: e.target.value}})} required />
            </FormField>
            <FormField label="Last Name" required>
              <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.user.lastName} onChange={(e) => setFormData({...formData, user: {...formData.user, lastName: e.target.value}})} required />
            </FormField>
          </div>
          <FormField label="Email" required>
            <input type="email" className="form-input w-full rounded-md border-gray-300" value={formData.user.email} onChange={(e) => setFormData({...formData, user: {...formData.user, email: e.target.value}})} required />
          </FormField>
          <FormField label={editingItem ? 'Password (leave blank to keep current)' : 'Password'} required={!editingItem}>
            <input type="password" className="form-input w-full rounded-md border-gray-300" value={formData.user.password} onChange={(e) => setFormData({...formData, user: {...formData.user, password: e.target.value}})} required={!editingItem} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone">
              <input type="tel" className="form-input w-full rounded-md border-gray-300" value={formData.user.phone} onChange={(e) => setFormData({...formData, user: {...formData.user, phone: e.target.value}})} />
            </FormField>
            <FormField label="Occupation">
              <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.occupation} onChange={(e) => setFormData({...formData, occupation: e.target.value})} />
            </FormField>
          </div>
          <FormField label="Address">
            <textarea className="form-textarea w-full rounded-md border-gray-300" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={2} />
          </FormField>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Parent"
        message="Are you sure you want to delete this parent? This action cannot be undone and will delete the associated user account."
        onConfirm={handleDelete}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}

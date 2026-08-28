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
import { classesApi } from '../../api/classes.api';
import { academicYearsApi } from '../../api/academic-years.api';
import { Class, AcademicYear } from '../../types';

export function ClassesPage() {
  const [data, setData] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Class | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Class | null>(null);
  
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', grade: '', section: '', academicYearId: '', capacity: 30 });
  
  const { page, limit, total, setPage, setTotal } = usePagination();

  const fetchDependencies = async () => {
    try {
      const res = await academicYearsApi.list({ limit: 100 });
      setAcademicYears(res.data);
    } catch {
      toast.error('Failed to load academic years');
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await classesApi.list({ page, limit, search });
      setData(result.data);
      setTotal(result.meta.total);
      setError(null);
    } catch {
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, setTotal]);

  useEffect(() => { 
    fetchDependencies();
    fetchData(); 
  }, [fetchData]);

  const handleOpenModal = (item?: Class) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        grade: String(item.grade),
        section: item.section || '',
        academicYearId: item.academicYearId,
        capacity: item.capacity,
      });
    } else {
      setEditingItem(null);
      const currentYear = academicYears.find(y => y.isCurrent);
      setFormData({ name: '', grade: '', section: '', academicYearId: currentYear?.id || '', capacity: 30 });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await classesApi.update(editingItem.id, formData);
        toast.success('Updated successfully');
      } else {
        await classesApi.create(formData);
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
      await classesApi.delete(deletingItem.id);
      toast.success('Deleted successfully');
      setIsDeleteOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (item: any) => item.name },
    { key: 'grade', header: 'Grade', render: (item: any) => item.grade },
    { key: 'section', header: 'Section', render: (item: any) => item.section || '-' },
    { key: 'academicYear', header: 'Academic Year', render: (item: any) => item.academicYear?.name || '-' },
    { key: 'capacity', header: 'Capacity', render: (item: any) => item.capacity },
    { key: 'enrolled', header: 'Enrolled', render: (item: any) => item._count?.students || 0 },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Class) => (
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
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Name" required>
            <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </FormField>
          <FormField label="Grade" required>
            <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} required />
          </FormField>
          <FormField label="Section">
            <input type="text" className="form-input w-full rounded-md border-gray-300" value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} />
          </FormField>
          <FormField label="Academic Year" required>
            <select className="form-select w-full rounded-md border-gray-300" value={formData.academicYearId} onChange={(e) => setFormData({...formData, academicYearId: e.target.value})} required>
              <option value="">Select an academic year...</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Capacity" required>
            <input type="number" className="form-input w-full rounded-md border-gray-300" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 30})} required />
          </FormField>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Class"
        message="Are you sure you want to delete this class? This action cannot be undone."
        onConfirm={handleDelete}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}

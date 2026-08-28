import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Check, X, Eye, BookOpen, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export default function StudentRegistrationManagementPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Selection states
  const [selectedReg, setSelectedReg] = useState<any | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const regRes = await apiClient.get('/admin/student-registrations?status=PENDING');
      setRegistrations(regRes.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load pending registrations data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async () => {
    if (!selectedReg) return;
    setIsApproving(true);
    try {
      await apiClient.post(`/admin/student-registrations/${selectedReg.id}/approve`);
      toast.success('Registration approved successfully!');
      setSelectedReg(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to approve registration');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this registration?')) return;

    try {
      await apiClient.post(`/admin/student-registrations/${id}/reject`);
      toast.success('Registration rejected.');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to reject registration');
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
            Pending Student Registrations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review student self-registrations, assign classes, and link parents.
          </p>
        </div>
      </div>

      <Card>
        {registrations.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No Pending Registrations</h3>
            <p className="text-sm text-gray-500 mt-1">All self-registered student applications have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase bg-gray-50/50">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Requested Grade</th>
                  <th className="py-3 px-4">Parent Details</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {registrations.map(reg => (
                  <tr key={reg.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900">{reg.firstName} {reg.lastName}</p>
                      <p className="text-xs text-gray-500">{reg.email}</p>
                      {reg.phone && <p className="text-xs text-gray-400 mt-0.5">{reg.phone}</p>}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="info">
                        Grade {reg.gradeNumber}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-800">{reg.parentName}</p>
                      <p className="text-xs text-gray-500">{reg.parentEmail}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Rel: {reg.relationship}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="p-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Assign Class & Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(reg.id)}
                          className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
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

      {/* Approval Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!selectedReg}
        title="Approve Registration"
        message={`Are you sure you want to approve the registration for ${selectedReg?.firstName} ${selectedReg?.lastName}? This will automatically enroll them in the class matching Grade ${selectedReg?.gradeNumber} under the current active academic year.`}
        confirmText="Confirm Approve"
        variant="primary"
        isLoading={isApproving}
        onConfirm={handleApprove}
        onClose={() => setSelectedReg(null)}
      />
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../../api/notifications.api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Bell, Check, Trash2, Eye, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ParentNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.list({ page: 1, limit: 100 });
      // Backend controller list method returns:
      // res.json({ data: notifications, meta: buildPaginationMeta(...) })
      // So data is inside res.data
      setNotifications(res.data || []);
      setError(null);
    } catch {
      setError('Failed to load notifications history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      toast.success('Notification marked as read');
      fetchNotifications();
    } catch {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'NEW_MATERIAL': return 'blue';
      case 'NEW_ASSIGNMENT': return 'orange';
      case 'ASSIGNMENT_DEADLINE': return 'red';
      case 'RESULT_RELEASED': return 'green';
      default: return 'gray';
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Bell className="w-8 h-8 text-purple-100" />
            Alerts & Notifications
          </h1>
          <p className="text-purple-100 mt-2 text-sm md:text-base">
            Stay updated with your child's academic updates, new materials, and test results.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-purple-50 text-indigo-700 text-sm font-bold rounded-xl shadow-md transition-all self-start sm:self-auto shrink-0 animate-pulse"
          >
            <Check className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications list feed */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((n: any) => {
            const color = getNotificationColor(n.type);
            const isUnread = !n.isRead;
            
            return (
              <Card 
                key={n.id} 
                className={`border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 ${
                  isUnread 
                    ? 'border-indigo-150 bg-indigo-50/5 hover:bg-indigo-50/10 shadow-sm' 
                    : 'border-gray-150 hover:shadow-sm opacity-80'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Unread indicator dot */}
                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0 animate-ping" />
                  )}
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {n.type?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <h3 className={`text-sm md:text-base font-bold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {n.title}
                    </h3>
                    
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="p-2 text-indigo-600 hover:text-indigo-850 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Mark as Read"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <Bell className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">All caught up!</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            You don't have any notifications at the moment.
          </p>
        </Card>
      )}
    </div>
  );
}

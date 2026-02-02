/**
 * Notifications Page
 * Full notifications list with filtering, pagination, and bulk actions.
 * 
 * @module pages/Notifications
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, Briefcase, Calendar, Clock, Gift, Info, 
  RefreshCw, XCircle, Check, CheckCheck, Trash2,
  Loader2, Filter, ChevronLeft, ChevronRight, Settings
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  getNotificationTypeConfig,
  formatNotificationTime,
  NOTIFICATION_TYPES
} from '@/services/notificationService';

// Icon mapping for notification types
const ICON_MAP = {
  Briefcase,
  Calendar,
  Bell,
  RefreshCw,
  Clock,
  Gift,
  XCircle,
  Info
};

/**
 * Single notification card
 */
function NotificationCard({ notification, onMarkRead, onDelete, isDeleting }) {
  const config = getNotificationTypeConfig(notification.type);
  const Icon = ICON_MAP[config.icon] || Info;

  // Determine link destination based on notification data
  const getLink = () => {
    if (notification.data?.application_id) {
      return `/applications/${notification.data.application_id}`;
    }
    if (notification.data?.interview_id) {
      return `/interviews/${notification.data.interview_id}`;
    }
    return null;
  };

  const link = getLink();

  return (
    <Card 
      className={cn(
        "group transition-all duration-200",
        !notification.is_read && "ring-1 ring-teal-brand-200 bg-teal-brand-50/30"
      )}
    >
      <div className="flex gap-4 p-4">
        {/* Icon */}
        <div className={cn(
          "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
          config.bgColor,
          "border",
          config.borderColor
        )}>
          <Icon size={20} className={config.color} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "text-sm",
                  !notification.is_read ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                )}>
                  {notification.title}
                </h3>
                {!notification.is_read && (
                  <span className="shrink-0 w-2 h-2 rounded-full bg-teal-brand-500" />
                )}
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {notification.message}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-slate-400">
                  {formatNotificationTime(notification.created_at)}
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  config.bgColor,
                  config.color
                )}>
                  {config.label}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.is_read && (
                <button
                  onClick={() => onMarkRead(notification.id)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-brand-600 transition-colors"
                  title="Mark as read"
                >
                  <Check size={16} />
                </button>
              )}
              {link && (
                <Link
                  to={link}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-brand-600 transition-colors"
                  title="View details"
                >
                  <ChevronRight size={16} />
                </Link>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                disabled={isDeleting}
                className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Delete"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Loading skeleton for notifications
 */
function NotificationSkeleton() {
  return (
    <Card>
      <div className="flex gap-4 p-4">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-3 w-full mb-2" />
          <div className="flex gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Notifications page component
 */
export default function Notifications() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Build query params
  const queryParams = {
    page,
    per_page: 20,
    ...(filter === 'unread' && { unread_only: true }),
    ...(typeFilter !== 'all' && { type: typeFilter })
  };

  // Fetch notifications
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', 'list', queryParams],
    queryFn: () => getNotifications(queryParams),
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: 'Marked as read', variant: 'success' });
    },
    onError: () => {
      toast({ title: 'Failed to mark as read', variant: 'error' });
    }
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ 
        title: 'All notifications marked as read', 
        description: `${data.count} notifications updated`,
        variant: 'success' 
      });
    },
    onError: () => {
      toast({ title: 'Failed to mark all as read', variant: 'error' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: 'Notification deleted', variant: 'success' });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: 'Failed to delete notification', variant: 'error' });
    }
  });

  const notifications = data?.notifications || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };
  const hasUnread = notifications.some(n => !n.is_read);

  // Type filter options
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.entries(NOTIFICATION_TYPES).map(([key, config]) => ({
      value: key,
      label: config.label
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">
            Stay updated on your job applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/settings">
            <Button variant="outline" size="sm">
              <Settings size={16} />
              Preferences
            </Button>
          </Link>
          {hasUnread && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              {markAllReadMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCheck size={16} />
              )}
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Filters:</span>
          </div>
          
          {/* Read status filter */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => { setFilter('all'); setPage(1); }}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-colors",
                filter === 'all' 
                  ? "bg-teal-brand-500 text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              All
            </button>
            <button
              onClick={() => { setFilter('unread'); setPage(1); }}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-colors border-l border-slate-200",
                filter === 'unread' 
                  ? "bg-teal-brand-500 text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              Unread
            </button>
          </div>

          {/* Type filter */}
          <Select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            options={typeOptions}
            className="w-40"
          />

          {/* Results count */}
          <span className="text-sm text-slate-500 ml-auto">
            {pagination.total} notification{pagination.total !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-12">
          <EmptyState
            icon={XCircle}
            title="Failed to load notifications"
            description="There was an error loading your notifications. Please try again."
            action={
              <Button onClick={() => refetch()}>
                <RefreshCw size={16} />
                Retry
              </Button>
            }
          />
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? "No unread notifications" : "No notifications yet"}
            description={
              filter === 'unread' 
                ? "You're all caught up! Check back later for updates."
                : "We'll notify you about important updates to your job applications."
            }
            action={filter === 'unread' && (
              <Button variant="outline" onClick={() => setFilter('all')}>
                View All Notifications
              </Button>
            )}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onDelete={(id) => setDeleteId(id)}
              isDeleting={deleteMutation.isPending && deleteId === notification.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-slate-600">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

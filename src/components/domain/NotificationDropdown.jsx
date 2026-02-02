/**
 * NotificationDropdown Component
 * Displays a dropdown panel with recent notifications.
 * Supports mark as read, view all, and notification actions.
 * 
 * @module components/domain/NotificationDropdown
 */

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, Briefcase, Calendar, Clock, Gift, Info, 
  RefreshCw, XCircle, Check, CheckCheck, ExternalLink,
  Loader2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead,
  getNotificationTypeConfig,
  formatNotificationTime 
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
 * Single notification item in dropdown
 */
function NotificationItem({ notification, onMarkRead }) {
  const config = getNotificationTypeConfig(notification.type);
  const Icon = ICON_MAP[config.icon] || Info;

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
  };

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
  const content = (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer",
        "hover:bg-slate-50",
        !notification.is_read && "bg-teal-brand-50/50"
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={cn(
        "shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
        config.bgColor
      )}>
        <Icon size={16} className={config.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm leading-snug",
            !notification.is_read ? "font-semibold text-slate-900" : "text-slate-700"
          )}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-teal-brand-500 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          {formatNotificationTime(notification.created_at)}
        </p>
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
}

/**
 * @typedef {Object} NotificationDropdownProps
 * @property {boolean} isOpen - Whether dropdown is visible
 * @property {Function} onClose - Close handler
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Notification dropdown panel
 * @param {NotificationDropdownProps} props
 * @returns {JSX.Element}
 */
export default function NotificationDropdown({ isOpen, onClose, className }) {
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch recent notifications
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => getNotifications({ page: 1, per_page: 10 }),
    enabled: isOpen,
    staleTime: 10000,
  });

  // Mark single notification as read
  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if click is on the bell button (parent handles this)
        const bellButton = event.target.closest('[aria-label*="Notifications"]');
        if (!bellButton) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const notifications = data?.notifications || [];
  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)]",
        "bg-white rounded-xl shadow-xl border border-slate-200",
        "animate-in fade-in slide-in-from-top-2 duration-200",
        "z-50",
        className
      )}
      role="menu"
      aria-orientation="vertical"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Notifications</h3>
        {hasUnread && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className={cn(
              "text-xs font-medium text-teal-brand-600 hover:text-teal-brand-700",
              "flex items-center gap-1 transition-colors",
              "disabled:opacity-50"
            )}
          >
            {markAllReadMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <CheckCheck size={12} />
            )}
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-teal-brand-500" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <XCircle size={24} className="text-red-500" />
            </div>
            <p className="text-sm text-slate-600">Failed to load notifications</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Bell size={24} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">No notifications yet</p>
            <p className="text-xs text-slate-500 mt-1">
              We'll notify you about important updates
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => markReadMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100">
          <Link
            to="/notifications"
            onClick={onClose}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-2 rounded-lg",
              "text-sm font-medium text-teal-brand-600",
              "hover:bg-teal-brand-50 transition-colors"
            )}
          >
            View all notifications
            <ExternalLink size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

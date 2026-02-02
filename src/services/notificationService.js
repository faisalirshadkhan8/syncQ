/**
 * Notification Service
 * Handles all notification-related API operations including fetching,
 * marking as read, preferences management, and real-time updates.
 * 
 * @module services/notificationService
 */

import api from './api';

/**
 * Notification type definitions with icons and colors
 * @type {Object.<string, {label: string, icon: string, color: string, bgColor: string}>}
 */
export const NOTIFICATION_TYPES = {
  application_update: {
    label: 'Application Update',
    icon: 'Briefcase',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    icon: 'Calendar',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  interview_reminder: {
    label: 'Interview Reminder',
    icon: 'Bell',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  status_change: {
    label: 'Status Change',
    icon: 'RefreshCw',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  },
  follow_up: {
    label: 'Follow Up',
    icon: 'Clock',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  offer_received: {
    label: 'Offer Received',
    icon: 'Gift',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  rejection: {
    label: 'Application Update',
    icon: 'XCircle',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  system: {
    label: 'System',
    icon: 'Info',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200'
  }
};

/**
 * Get notification type configuration
 * @param {string} type - Notification type key
 * @returns {Object} Type configuration with label, icon, colors
 */
export const getNotificationTypeConfig = (type) => {
  return NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.system;
};

/**
 * @typedef {Object} Notification
 * @property {number} id - Notification ID
 * @property {string} type - Notification type
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {boolean} is_read - Read status
 * @property {string} created_at - Creation timestamp
 * @property {Object} [data] - Additional data (application_id, interview_id, etc.)
 */

/**
 * @typedef {Object} NotificationPreferences
 * @property {boolean} email_enabled - Email notifications enabled
 * @property {boolean} push_enabled - Push notifications enabled
 * @property {boolean} application_updates - Application update notifications
 * @property {boolean} interview_reminders - Interview reminder notifications
 * @property {boolean} follow_up_reminders - Follow-up reminder notifications
 * @property {boolean} weekly_digest - Weekly digest enabled
 * @property {string} reminder_time - Default reminder time (e.g., "1_day_before")
 */

/**
 * @typedef {Object} NotificationsResponse
 * @property {Notification[]} notifications - Array of notifications
 * @property {Object} pagination - Pagination info
 * @property {number} pagination.page - Current page
 * @property {number} pagination.per_page - Items per page
 * @property {number} pagination.total - Total items
 * @property {number} pagination.pages - Total pages
 */

/**
 * Fetch paginated notifications with optional filters
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.per_page=20] - Items per page
 * @param {boolean} [params.unread_only] - Filter unread only
 * @param {string} [params.type] - Filter by notification type
 * @returns {Promise<NotificationsResponse>}
 */
export const getNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

/**
 * Get count of unread notifications
 * Note: This is derived from the notifications history endpoint
 * since there's no dedicated unread count endpoint in the API.
 * @returns {Promise<{count: number}>}
 */
export const getUnreadCount = async () => {
  // The API doesn't have a dedicated unread count endpoint
  // Return 0 for now - this could be computed from notification history if needed
  return { count: 0 };
};

/**
 * Mark a single notification as read
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Notification>}
 */
export const markAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 * @returns {Promise<{message: string, count: number}>}
 */
export const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

/**
 * Delete a notification
 * @param {number} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  await api.delete(`/notifications/${notificationId}`);
};

/**
 * Get notification preferences
 * @returns {Promise<NotificationPreferences>}
 */
export const getPreferences = async () => {
  const response = await api.get('/notifications/preferences');
  return response.data;
};

/**
 * Update notification preferences
 * @param {Partial<NotificationPreferences>} preferences - Preferences to update
 * @returns {Promise<NotificationPreferences>}
 */
export const updatePreferences = async (preferences) => {
  const response = await api.put('/notifications/preferences', preferences);
  return response.data;
};

/**
 * Reminder time options for notification preferences
 */
export const REMINDER_TIMES = [
  { value: '15_minutes_before', label: '15 minutes before' },
  { value: '30_minutes_before', label: '30 minutes before' },
  { value: '1_hour_before', label: '1 hour before' },
  { value: '2_hours_before', label: '2 hours before' },
  { value: '1_day_before', label: '1 day before' },
  { value: '2_days_before', label: '2 days before' }
];

/**
 * Format notification time for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted relative time
 */
export const formatNotificationTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
  getNotificationTypeConfig,
  formatNotificationTime,
  NOTIFICATION_TYPES,
  REMINDER_TIMES
};

/**
 * NotificationBell Component
 * Displays a bell icon with unread notification count badge.
 * Triggers dropdown on click.
 * 
 * @module components/ui/NotificationBell
 */

import React from 'react';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/utils/cn';
import { getUnreadCount } from '@/services/notificationService';

/**
 * @typedef {Object} NotificationBellProps
 * @property {boolean} [isOpen] - Whether dropdown is open
 * @property {Function} [onClick] - Click handler
 * @property {string} [className] - Additional CSS classes
 */

/**
 * Notification bell with unread count badge
 * @param {NotificationBellProps} props
 * @returns {JSX.Element}
 */
export default function NotificationBell({ isOpen, onClick, className }) {
  // Fetch unread count with polling every 30 seconds
  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 10000,
  });

  const unreadCount = data?.count || 0;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 rounded-lg transition-all duration-200",
        "hover:bg-slate-100 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-teal-brand-500/20",
        isOpen && "bg-slate-100",
        className
      )}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <Bell 
        size={20} 
        className={cn(
          "transition-colors duration-200",
          isOpen ? "text-teal-brand-600" : "text-slate-600",
          unreadCount > 0 && "text-slate-700"
        )} 
      />
      
      {/* Unread count badge */}
      {unreadCount > 0 && (
        <span 
          className={cn(
            "absolute -top-0.5 -right-0.5 flex items-center justify-center",
            "min-w-[18px] h-[18px] px-1 rounded-full",
            "bg-red-500 text-white text-[10px] font-bold",
            "shadow-sm border-2 border-white",
            "animate-in fade-in zoom-in duration-200"
          )}
        >
          {displayCount}
        </span>
      )}

      {/* Pulse animation for new notifications */}
      {unreadCount > 0 && (
        <span 
          className={cn(
            "absolute -top-0.5 -right-0.5",
            "w-[18px] h-[18px] rounded-full",
            "bg-red-400 opacity-75",
            "animate-ping"
          )}
          style={{ animationDuration: '2s' }}
        />
      )}
    </button>
  );
}

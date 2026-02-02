/**
 * Header Component
 * Top navigation bar with search, notifications, and user menu.
 * 
 * @module components/layout/Header
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';
import Input from '@/components/ui/Input';
import NotificationBell from '@/components/ui/NotificationBell';
import NotificationDropdown from '@/components/domain/NotificationDropdown';
import useAuthStore from '@/stores/useAuthStore';

export default function Header({ title = "Dashboard" }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl transition-all duration-200">
      <div className="flex flex-1 items-center justify-between">

        {/* Title / Breadcrumbs */}
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:block w-64">
            <Input
              leftIcon={<Search size={16} />}
              placeholder="Quick search..."
              className="bg-slate-50 border-slate-200 focus:border-teal-brand-500/50 h-9 text-xs"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <NotificationBell
              isOpen={isNotificationsOpen}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            />
            <NotificationDropdown
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={cn(
                "h-9 w-9 rounded-full bg-teal-brand-100 border-2 border-transparent",
                "flex items-center justify-center overflow-hidden cursor-pointer",
                "hover:border-teal-brand-300 transition-all",
                isUserMenuOpen && "border-teal-brand-400"
              )}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-teal-brand-700">
                  {user?.first_name?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsUserMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-medium text-slate-900 truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings size={16} className="text-slate-400" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

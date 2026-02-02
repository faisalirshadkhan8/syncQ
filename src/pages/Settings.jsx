/**
 * Settings Page
 * Comprehensive settings with profile, security, notifications, and preferences.
 * 
 * @module pages/Settings
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/stores/useAuthStore';
import { authService } from '@/services/authService';
import { getPreferences, updatePreferences, REMINDER_TIMES } from '@/services/notificationService';
import { useToast } from '@/hooks/useToast';
import { 
  User, Lock, Mail, Save, Bell, Settings as SettingsIcon, 
  Loader2, Check, Globe, Palette, Clock, Shield
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import TwoFactorSetup from './settings/TwoFactorSetup';

/**
 * Toggle switch component
 */
function Toggle({ checked, onChange, disabled, label, description }) {
  return (
    <label className={cn(
      "flex items-start gap-4 p-4 rounded-lg border border-slate-200 cursor-pointer transition-all",
      "hover:bg-slate-50",
      checked && "bg-teal-brand-50/50 border-teal-brand-200",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={cn(
          "w-11 h-6 rounded-full transition-colors",
          checked ? "bg-teal-brand-500" : "bg-slate-300"
        )}>
          <div className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5"
          )} />
        </div>
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-900">{label}</p>
        {description && (
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

/**
 * Profile settings form
 */
const ProfileForm = () => {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();

  const schema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    desired_role: z.string().optional(),
    desired_salary_min: z.coerce.number().optional(),
    desired_salary_max: z.coerce.number().optional(),
    preferred_work_type: z.enum(['remote', 'hybrid', 'onsite', 'any']).default('any'),
    portfolio_url: z.string().url().optional().or(z.literal('')),
    linkedin_url: z.string().url().optional().or(z.literal('')),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      desired_role: user?.desired_role || '',
      desired_salary_min: user?.desired_salary_min || '',
      desired_salary_max: user?.desired_salary_max || '',
      preferred_work_type: user?.preferred_work_type || 'any',
      portfolio_url: user?.portfolio_url || '',
      linkedin_url: user?.linkedin_url || '',
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => authService.updateProfile({
      ...data,
      desired_salary_min: data.desired_salary_min || null,
      desired_salary_max: data.desired_salary_max || null,
    }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      toast({ title: 'Profile updated successfully', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to update profile', variant: 'error' })
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="First Name" 
            error={errors.first_name?.message} 
            {...register('first_name')} 
          />
          <Input 
            label="Last Name" 
            error={errors.last_name?.message} 
            {...register('last_name')} 
          />
        </div>
        <div className="mt-4">
          <Input 
            label="Email Address" 
            type="email" 
            error={errors.email?.message} 
            {...register('email')} 
          />
        </div>
      </div>

      {/* Job Preferences */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Job Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Desired Role" 
            placeholder="e.g. Frontend Engineer" 
            error={errors.desired_role?.message} 
            {...register('desired_role')} 
          />
          <Select
            label="Work Preference"
            error={errors.preferred_work_type?.message}
            {...register('preferred_work_type')}
            options={[
              { value: 'remote', label: 'Remote' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'onsite', label: 'On-site' },
              { value: 'any', label: 'Any' },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input 
            label="Minimum Salary" 
            type="number" 
            placeholder="100000" 
            error={errors.desired_salary_min?.message} 
            {...register('desired_salary_min')} 
          />
          <Input 
            label="Maximum Salary" 
            type="number" 
            placeholder="150000" 
            error={errors.desired_salary_max?.message} 
            {...register('desired_salary_max')} 
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Social & Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="LinkedIn URL" 
            placeholder="https://linkedin.com/in/..." 
            error={errors.linkedin_url?.message} 
            {...register('linkedin_url')} 
          />
          <Input 
            label="Portfolio URL" 
            placeholder="https://..." 
            error={errors.portfolio_url?.message} 
            {...register('portfolio_url')} 
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

/**
 * Password change form
 */
const PasswordForm = () => {
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(z.object({
      old_password: z.string().min(1, 'Current password is required'),
      new_password: z.string().min(8, 'Password must be at least 8 characters'),
      confirm_password: z.string().min(1, 'Confirm password is required'),
    }).refine((data) => data.new_password === data.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
    }))
  });

  const mutation = useMutation({
    mutationFn: (data) => authService.changePassword({
      old_password: data.old_password,
      new_password: data.new_password
    }),
    onSuccess: () => {
      toast({ title: 'Password changed successfully', variant: 'success' });
      reset();
    },
    onError: (err) => {
      toast({ 
        title: 'Failed to change password',
        description: err.response?.data?.detail || 'Check your current password',
        variant: 'error' 
      });
    }
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 max-w-md">
      <Input
        label="Current Password"
        type="password"
        error={errors.old_password?.message}
        {...register('old_password')}
      />
      <Input
        label="New Password"
        type="password"
        error={errors.new_password?.message}
        {...register('new_password')}
      />
      <Input
        label="Confirm New Password"
        type="password"
        error={errors.confirm_password?.message}
        {...register('confirm_password')}
      />

      <div className="pt-4">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Updating...
            </>
          ) : (
            'Update Password'
          )}
        </Button>
      </div>
    </form>
  );
};

/**
 * Security settings section (Password + 2FA)
 */
const SecuritySection = () => {
  return (
    <div className="space-y-8">
      {/* Password Change Section */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Change Password
        </h3>
        <PasswordForm />
      </div>

      {/* Two-Factor Authentication Section */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Two-Factor Authentication
        </h3>
        <TwoFactorSetup />
      </div>
    </div>
  );
};

/**
 * Notification preferences form
 */
const NotificationForm = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: getPreferences
  });

  const mutation = useMutation({
    mutationFn: updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({ title: 'Preferences updated', variant: 'success' });
    },
    onError: () => {
      toast({ title: 'Failed to update preferences', variant: 'error' });
    }
  });

  const handleToggle = (key, value) => {
    mutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Notification Channels
        </h3>
        <div className="space-y-3">
          <Toggle
            checked={preferences?.email_enabled ?? true}
            onChange={(v) => handleToggle('email_enabled', v)}
            label="Email Notifications"
            description="Receive notifications via email"
            disabled={mutation.isPending}
          />
          <Toggle
            checked={preferences?.push_enabled ?? false}
            onChange={(v) => handleToggle('push_enabled', v)}
            label="Push Notifications"
            description="Receive browser push notifications"
            disabled={mutation.isPending}
          />
        </div>
      </div>

      {/* Notification Types */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Notification Types
        </h3>
        <div className="space-y-3">
          <Toggle
            checked={preferences?.application_updates ?? true}
            onChange={(v) => handleToggle('application_updates', v)}
            label="Application Updates"
            description="When your application status changes"
            disabled={mutation.isPending}
          />
          <Toggle
            checked={preferences?.interview_reminders ?? true}
            onChange={(v) => handleToggle('interview_reminders', v)}
            label="Interview Reminders"
            description="Reminders before scheduled interviews"
            disabled={mutation.isPending}
          />
          <Toggle
            checked={preferences?.follow_up_reminders ?? true}
            onChange={(v) => handleToggle('follow_up_reminders', v)}
            label="Follow-up Reminders"
            description="Reminders to follow up on applications"
            disabled={mutation.isPending}
          />
          <Toggle
            checked={preferences?.weekly_digest ?? false}
            onChange={(v) => handleToggle('weekly_digest', v)}
            label="Weekly Digest"
            description="Weekly summary of your job search activity"
            disabled={mutation.isPending}
          />
        </div>
      </div>

      {/* Reminder Timing */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Reminder Timing
        </h3>
        <div className="max-w-xs">
          <Select
            label="Interview Reminder"
            value={preferences?.reminder_time || '1_day_before'}
            onChange={(e) => handleToggle('reminder_time', e.target.value)}
            options={REMINDER_TIMES}
          />
          <p className="text-xs text-slate-500 mt-2">
            How early to receive interview reminders
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Settings Page
 */
const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Personal information' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password & 2FA' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email & alerts' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all",
                    activeTab === tab.id
                      ? "bg-teal-brand-50 text-teal-brand-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? "text-teal-brand-600" : ""} />
                  <div>
                    <p className="text-sm">{tab.label}</p>
                    <p className={cn(
                      "text-xs",
                      activeTab === tab.id ? "text-teal-brand-600" : "text-slate-400"
                    )}>
                      {tab.description}
                    </p>
                  </div>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {/* Tab Header */}
            <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-200">
              {(() => {
                const tab = tabs.find(t => t.id === activeTab);
                const Icon = tab?.icon || SettingsIcon;
                return (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-teal-brand-50 flex items-center justify-center">
                      <Icon size={20} className="text-teal-brand-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{tab?.label}</h2>
                      <p className="text-sm text-slate-500">{tab?.description}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && <ProfileForm />}
            {activeTab === 'security' && <SecuritySection />}
            {activeTab === 'notifications' && <NotificationForm />}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;

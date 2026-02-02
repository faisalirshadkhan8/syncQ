/**
 * Reset Password Page
 * Allows users to reset their password using a token from email.
 * 
 * @module pages/auth/ResetPassword
 * @see FRONTEND_API_DOCUMENTATION.md Section 1: Authentication - Password Reset Confirm
 */

import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { 
  Lock, Eye, EyeOff, CheckCircle2, XCircle, Shield, ArrowRight
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

// Password validation schema
const schema = z.object({
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  new_password_confirm: z.string()
}).refine((data) => data.new_password === data.new_password_confirm, {
  message: "Passwords don't match",
  path: ['new_password_confirm']
});

/**
 * Reset Password Page Component
 */
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get('token');

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema)
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch('new_password');

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 1, label: 'Weak', color: 'bg-rose-500' };
    if (strength <= 4) return { strength: 2, label: 'Medium', color: 'bg-amber-500' };
    return { strength: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Reset mutation
  const mutation = useMutation({
    mutationFn: (data) => authService.confirmPasswordReset(
      token,
      data.new_password,
      data.new_password_confirm
    ),
    onSuccess: () => {
      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successful! Please log in with your new password.' } 
        });
      }, 3000);
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  // No token error
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Job Application Tracker
            </h1>
          </div>

          <Card className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
              <XCircle size={40} className="text-rose-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Invalid Reset Link
              </h2>
              <p className="text-slate-500">
                This password reset link is invalid or has expired.
              </p>
            </div>
            <Link to="/forgot-password">
              <Button className="w-full">
                Request New Reset Link
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Job Application Tracker
          </h1>
        </div>

        <Card className="p-8">
          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
                  <Shield size={32} className="text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Reset Your Password
                </h2>
                <p className="text-slate-500">
                  Create a new secure password for your account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* New Password */}
                <div>
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    error={errors.new_password?.message}
                    {...register('new_password')}
                    icon={Lock}
                    disabled={mutation.isPending}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "h-1.5 flex-1 rounded-full transition-colors",
                              level <= passwordStrength.strength 
                                ? passwordStrength.color 
                                : "bg-slate-200"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        Password strength: <span className="font-medium">{passwordStrength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  error={errors.new_password_confirm?.message}
                  {...register('new_password_confirm')}
                  icon={Lock}
                  disabled={mutation.isPending}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />

                {/* Password Requirements */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-medium text-slate-700 mb-2">Password must contain:</p>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        password?.length >= 8 ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        /[A-Z]/.test(password) ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        /[a-z]/.test(password) ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      One lowercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        /[0-9]/.test(password) ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      One number
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        /[^A-Za-z0-9]/.test(password) ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      One special character
                    </li>
                  </ul>
                </div>

                {mutation.isError && (
                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
                    <p className="text-sm text-rose-600">
                      {mutation.error?.response?.data?.error || 
                       'Failed to reset password. The link may be expired.'}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Shield size={16} className="mr-2 animate-pulse" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <Shield size={16} className="mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>

                <Link to="/login">
                  <Button type="button" variant="ghost" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Password Reset Successful!
                </h2>
                <p className="text-slate-500">
                  Your password has been reset. You can now log in with your new password.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  Redirecting to login page...
                </p>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Continue to Login
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;

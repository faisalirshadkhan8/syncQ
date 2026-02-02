/**
 * Forgot Password Page
 * Allows users to request a password reset email.
 * 
 * @module pages/auth/ForgotPassword
 * @see FRONTEND_API_DOCUMENTATION.md Section 1: Authentication - Password Reset
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { 
  Mail, ArrowLeft, Send, CheckCircle2
} from 'lucide-react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

// Validation schema
const schema = z.object({
  email: z.string().email('Please enter a valid email address')
});

/**
 * Forgot Password Page Component
 */
const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema)
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const email = watch('email');

  // Reset request mutation
  const mutation = useMutation({
    mutationFn: (email) => authService.requestPasswordReset(email),
    onSuccess: () => {
      setSubmitted(true);
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data.email);
  };

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
          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
                  <Mail size={32} className="text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Forgot Password?
                </h2>
                <p className="text-slate-500">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="your.email@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                  icon={Mail}
                  disabled={mutation.isPending}
                />

                {mutation.isError && (
                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
                    <p className="text-sm text-rose-600">
                      {mutation.error?.response?.data?.error || 
                       'Failed to send reset email. Please try again.'}
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
                      <Send size={16} className="mr-2 animate-pulse" />
                      Sending Email...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <Link to="/login">
                  <Button type="button" variant="ghost" className="w-full">
                    <ArrowLeft size={16} className="mr-2" />
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
                  Check Your Email
                </h2>
                <p className="text-slate-500 mb-1">
                  If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
                </p>
                <p className="text-sm text-slate-400">
                  The link will expire in 1 hour for security reasons.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                <p className="text-sm text-teal-900">
                  <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setSubmitted(false);
                    mutation.reset();
                  }}
                  variant="secondary" 
                  className="w-full"
                >
                  <Send size={16} className="mr-2" />
                  Send Another Email
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            🔒 For security, we don't disclose whether an account exists. 
            If you don't receive an email, the account may not exist.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

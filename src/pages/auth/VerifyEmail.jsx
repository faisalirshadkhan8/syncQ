/**
 * Email Verification Page
 * Handles email verification from link in user's email.
 * 
 * @module pages/auth/VerifyEmail
 * @see FRONTEND_API_DOCUMENTATION.md Section 1: Authentication - Verify Email
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { 
  CheckCircle2, XCircle, Loader2, Mail, ArrowRight, RefreshCw
} from 'lucide-react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

/**
 * Email Verification Page Component
 */
const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'resending'
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: (token) => authService.verifyEmail(token),
    onSuccess: () => {
      setStatus('success');
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Email verified! You can now log in.' } 
        });
      }, 3000);
    },
    onError: (error) => {
      console.error('Verification error:', error);
      setStatus('error');
    }
  });

  // Resend mutation
  const resendMutation = useMutation({
    mutationFn: (email) => authService.resendVerification(email),
    onSuccess: () => {
      setStatus('resent');
    },
    onError: (error) => {
      console.error('Resend error:', error);
      setStatus('error');
    }
  });

  // Auto-verify on mount if token exists
  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setStatus('no-token');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = () => {
    if (email) {
      setStatus('resending');
      resendMutation.mutate(email);
    }
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
          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-teal-100 flex items-center justify-center">
                <Loader2 size={40} className="text-teal-600 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Verifying Your Email
                </h2>
                <p className="text-slate-500">
                  Please wait while we verify your email address...
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Email Verified!
                </h2>
                <p className="text-slate-500">
                  Your email has been successfully verified. You can now access all features.
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

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
                <XCircle size={40} className="text-rose-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-slate-500">
                  {verifyMutation.error?.response?.data?.error || 
                   'The verification link is invalid or has expired.'}
                </p>
              </div>
              <div className="space-y-3">
                {email && (
                  <Button 
                    onClick={handleResend} 
                    variant="secondary" 
                    className="w-full"
                    disabled={resendMutation.isPending}
                  >
                    {resendMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} className="mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                )}
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* No Token State */}
          {status === 'no-token' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                <Mail size={40} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-slate-500">
                  Please click the verification link sent to your email address.
                </p>
              </div>
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          {/* Resending State */}
          {status === 'resending' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-teal-100 flex items-center justify-center">
                <Loader2 size={40} className="text-teal-600 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Sending Email
                </h2>
                <p className="text-slate-500">
                  Please wait while we send you a new verification email...
                </p>
              </div>
            </div>
          )}

          {/* Resent State */}
          {status === 'resent' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                <Mail size={40} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Email Sent!
                </h2>
                <p className="text-slate-500">
                  A new verification email has been sent. Please check your inbox.
                </p>
              </div>
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Help Text */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Didn't receive the email? Check your spam folder or{' '}
          <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;

/**
 * Two-Factor Authentication Setup Page
 * Complete 2FA management including setup, verification, and backup codes.
 * 
 * @module pages/settings/TwoFactorSetup
 * @see FRONTEND_API_DOCUMENTATION.md Section 9: Two-Factor Authentication
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield, ShieldCheck, ShieldOff, Smartphone, Key, Copy, Check,
  Loader2, AlertTriangle, RefreshCw, Eye, EyeOff, Download,
  QrCode, Lock, ArrowLeft, CheckCircle2, XCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import twoFactorService from '@/services/twoFactorService';

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * TOTP Code Input - 6 digit code input with auto-focus
 */
function CodeInput({ value, onChange, disabled, autoFocus = true }) {
  // Create refs array outside component
  const inputRefs = React.useMemo(() => 
    Array(6).fill(null).map(() => React.createRef()), 
    []
  );

  const handleChange = (index, char) => {
    if (!/^\d*$/.test(char)) return;
    
    const newValue = value.split('');
    newValue[index] = char;
    onChange(newValue.join('').slice(0, 6));
    
    // Auto-focus next input
    if (char && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(paste);
    if (paste.length > 0) {
      inputRefs[Math.min(paste.length, 5)].current?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={inputRefs[index]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          className={cn(
            "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all",
            "focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none",
            value[index] ? "border-teal-500 bg-teal-50" : "border-slate-200",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Backup codes display with copy functionality
 */
function BackupCodesDisplay({ codes, onCopy, onDownload }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = codes.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `Job Application Tracker - 2FA Backup Codes\n${'='.repeat(45)}\n\nKeep these codes safe! Each code can only be used once.\n\n${codes.join('\n')}\n\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Save these backup codes!</p>
            <p className="text-sm text-amber-700 mt-1">
              Each code can only be used once. Store them securely.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-slate-50 font-mono text-sm">
        {codes.map((code, i) => (
          <div key={i} className="p-2 rounded-lg bg-white border border-slate-200 text-center">
            {code}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={handleCopy} className="flex-1">
          {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
          {copied ? 'Copied!' : 'Copy All'}
        </Button>
        <Button variant="secondary" onClick={handleDownload} className="flex-1">
          <Download size={16} className="mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}

/**
 * 2FA Status Card
 */
function StatusCard({ status, onEnable, onDisable }) {
  if (!status) return null;

  return (
    <Card className={cn(
      "p-6 border-2",
      status.enabled 
        ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50" 
        : "border-slate-200"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center",
          status.enabled ? "bg-emerald-100" : "bg-slate-100"
        )}>
          {status.enabled ? (
            <ShieldCheck size={28} className="text-emerald-600" />
          ) : (
            <Shield size={28} className="text-slate-400" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-900">
              Two-Factor Authentication
            </h3>
            <Badge variant={status.enabled ? 'success' : 'secondary'}>
              {status.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          
          <p className="text-slate-500 text-sm mb-4">
            {status.enabled 
              ? 'Your account is protected with an additional layer of security.'
              : 'Add an extra layer of security to your account using an authenticator app.'
            }
          </p>

          {status.enabled && (
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
              {status.last_used_at && (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Last used: {new Date(status.last_used_at).toLocaleDateString()}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Key size={14} className="text-amber-500" />
                {status.backup_codes_remaining} backup codes remaining
              </span>
            </div>
          )}

          <div className="flex gap-3">
            {status.enabled ? (
              <Button variant="danger" onClick={onDisable}>
                <ShieldOff size={16} className="mr-2" />
                Disable 2FA
              </Button>
            ) : (
              <Button onClick={onEnable}>
                <Shield size={16} className="mr-2" />
                Enable 2FA
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Setup wizard steps
 */
function SetupWizard({ setupData, onConfirm, onCancel, isConfirming }) {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [codesViewed, setCodesViewed] = useState(false);

  const handleConfirm = () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    setError('');
    onConfirm(code);
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
              step >= s 
                ? "bg-teal-500 text-white" 
                : "bg-slate-100 text-slate-400"
            )}>
              {step > s ? <Check size={18} /> : s}
            </div>
            {s < 3 && (
              <div className={cn(
                "w-12 h-1 rounded",
                step > s ? "bg-teal-500" : "bg-slate-200"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Scan QR Code */}
      {step === 1 && (
        <div className="text-center space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Scan QR Code
            </h3>
            <p className="text-slate-500">
              Open your authenticator app and scan this QR code
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-100">
              {setupData?.qr_code ? (
                <img 
                  src={setupData.qr_code} 
                  alt="2FA QR Code"
                  className="w-48 h-48"
                  onError={(e) => {
                    console.error('QR Code failed to load. First 100 chars:', setupData.qr_code?.substring(0, 100));
                    console.error('QR Code length:', setupData.qr_code?.length);
                    // Show fallback message
                    const parent = e.target.parentElement;
                    parent.innerHTML = `
                      <div class="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-lg">
                        <div class="text-center text-slate-500 p-4">
                          <p class="text-xs mb-2">QR Code failed to load</p>
                          <p class="text-xs">Use manual entry below</p>
                        </div>
                      </div>
                    `;
                  }}
                  onLoad={() => {
                    console.log('✅ QR Code loaded successfully');
                  }}
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-lg">
                  <div className="text-center text-slate-500">
                    <QrCode size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs">QR Code not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Manual entry */}
          <div className="p-4 rounded-xl bg-slate-50">
            <p className="text-xs text-slate-500 mb-2">Can't scan? Enter this code manually:</p>
            <code className="text-sm font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 select-all">
              {setupData.secret}
            </code>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => setStep(2)} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Save Backup Codes */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Save Backup Codes
            </h3>
            <p className="text-slate-500">
              Store these codes in a safe place. You'll need them if you lose access to your authenticator.
            </p>
          </div>

          <BackupCodesDisplay 
            codes={setupData.backup_codes}
            onCopy={() => setCodesViewed(true)}
            onDownload={() => setCodesViewed(true)}
          />

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <Button 
              onClick={() => setStep(3)} 
              className="flex-1"
              disabled={!codesViewed}
            >
              {codesViewed ? 'Continue' : 'Save codes first'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Verify */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Verify Setup
            </h3>
            <p className="text-slate-500">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <CodeInput 
            value={code} 
            onChange={(val) => { setCode(val); setError(''); }}
            disabled={isConfirming}
          />

          {error && (
            <p className="text-center text-sm text-rose-500">{error}</p>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(2)}>
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="flex-1"
              disabled={code.length !== 6 || isConfirming}
            >
              {isConfirming ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} className="mr-2" />
                  Enable 2FA
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Disable 2FA Modal
 */
function Disable2FAModal({ isOpen, onClose, onConfirm, isLoading }) {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    onConfirm(code, password);
  };

  React.useEffect(() => {
    if (!isOpen) {
      setCode('');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Disable Two-Factor Authentication" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-rose-800">Warning</p>
              <p className="text-sm text-rose-700 mt-1">
                Disabling 2FA will make your account less secure. Are you sure you want to continue?
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Authenticator Code
            </label>
            <CodeInput value={code} onChange={setCode} disabled={isLoading} />
          </div>

          <Input
            type={showPassword ? 'text' : 'password'}
            label="Current Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </div>

        {error && (
          <p className="text-sm text-rose-500 text-center">{error}</p>
        )}

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="danger" 
            disabled={isLoading || code.length !== 6 || !password}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Disabling...
              </>
            ) : (
              'Disable 2FA'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Regenerate Backup Codes Modal
 */
function RegenerateCodesModal({ isOpen, onClose, onRegenerate, isLoading, newCodes }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('verify'); // 'verify' | 'codes'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    onRegenerate(code);
  };

  React.useEffect(() => {
    if (newCodes) {
      setStep('codes');
    }
  }, [newCodes]);

  React.useEffect(() => {
    if (!isOpen) {
      setCode('');
      setError('');
      setStep('verify');
    }
  }, [isOpen]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={step === 'verify' ? 'Regenerate Backup Codes' : 'New Backup Codes'} 
      size="md"
    >
      {step === 'verify' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-slate-600">
            Enter your authenticator code to generate new backup codes. 
            This will invalidate all existing backup codes.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
              Authenticator Code
            </label>
            <CodeInput value={code} onChange={setCode} disabled={isLoading} />
          </div>

          {error && (
            <p className="text-sm text-rose-500 text-center">{error}</p>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || code.length !== 6} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <p className="font-medium text-emerald-800">
                New backup codes generated successfully!
              </p>
            </div>
          </div>

          <BackupCodesDisplay codes={newCodes} />

          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TwoFactorSetup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [newBackupCodes, setNewBackupCodes] = useState(null);

  // Fetch 2FA status
  const { data: status, isLoading } = useQuery({
    queryKey: ['2fa-status'],
    queryFn: twoFactorService.get2FAStatus
  });

  // Setup mutation
  const setupMutation = useMutation({
    mutationFn: twoFactorService.setup2FA,
    onSuccess: (data) => {
      console.log('2FA Setup Data:', {
        hasQrCode: !!data.qr_code,
        qrCodeLength: data.qr_code?.length,
        qrCodeStart: data.qr_code?.substring(0, 50),
        hasSecret: !!data.secret,
        secret: data.secret,
        backupCodesCount: data.backup_codes?.length
      });
      
      // Fix QR code data URI if needed - create new object to ensure re-render
      const processedData = {
        ...data,
        qr_code: data.qr_code?.startsWith('data:') 
          ? data.qr_code 
          : `data:image/png;base64,${data.qr_code}`
      };
      
      console.log('QR Code after fix:', processedData.qr_code?.substring(0, 50));
      
      setSetupData(processedData);
      setIsSetupModalOpen(true);
    },
    onError: (error) => {
      console.error('2FA Setup Error:', error);
      if (toast) {
        toast({
          title: 'Setup failed',
          description: error.response?.data?.error || 'Please try again.',
          variant: 'error'
        });
      }
    }
  });

  // Confirm mutation
  const confirmMutation = useMutation({
    mutationFn: twoFactorService.confirm2FA,
    onSuccess: () => {
      if (toast) {
        toast({
          title: '2FA Enabled!',
          description: 'Your account is now protected with two-factor authentication.',
          variant: 'success'
        });
      }
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      setIsSetupModalOpen(false);
      setSetupData(null);
    },
    onError: (error) => {
      if (toast) {
        toast({
          title: 'Verification failed',
          description: error.response?.data?.error || 'Invalid code. Please try again.',
          variant: 'error'
        });
      }
    }
  });

  // Disable mutation
  const disableMutation = useMutation({
    mutationFn: ({ code, password }) => twoFactorService.disable2FA(code, password),
    onSuccess: () => {
      if (toast) {
        toast({
          title: '2FA Disabled',
          description: 'Two-factor authentication has been disabled.',
          variant: 'success'
        });
      }
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      setIsDisableModalOpen(false);
    },
    onError: (error) => {
      if (toast) {
        toast({
          title: 'Failed to disable',
          description: error.response?.data?.error || 'Invalid code or password.',
          variant: 'error'
        });
      }
    }
  });

  // Regenerate codes mutation
  const regenerateMutation = useMutation({
    mutationFn: twoFactorService.regenerateBackupCodes,
    onSuccess: (data) => {
      setNewBackupCodes(data.backup_codes);
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      if (toast) {
        toast({
          title: 'Codes regenerated',
          description: 'Your new backup codes have been generated.',
          variant: 'success'
        });
      }
    },
    onError: (error) => {
      if (toast) {
        toast({
          title: 'Regeneration failed',
          description: error.response?.data?.error || 'Invalid code.',
          variant: 'error'
        });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <StatusCard
        status={status}
        onEnable={() => setupMutation.mutate()}
        onDisable={() => setIsDisableModalOpen(true)}
      />

      {/* Additional Actions (when enabled) */}
      {status?.enabled && (
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">Manage 2FA</h3>
          
          <div className="space-y-4">
            {/* Regenerate Backup Codes */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Key size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Backup Codes</p>
                  <p className="text-sm text-slate-500">
                    {status.backup_codes_remaining} codes remaining
                  </p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setIsRegenerateModalOpen(true)}
              >
                <RefreshCw size={14} className="mr-2" />
                Regenerate
              </Button>
            </div>

            {/* Authenticator App Info */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <Smartphone size={20} className="text-teal-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Authenticator App</p>
                <p className="text-sm text-slate-500">
                  Using TOTP-based authentication
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recommended Apps (when disabled) */}
      {!status?.enabled && (
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4">Recommended Authenticator Apps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Google Authenticator', platform: 'iOS / Android' },
              { name: 'Microsoft Authenticator', platform: 'iOS / Android' },
              { name: 'Authy', platform: 'iOS / Android / Desktop' }
            ].map((app) => (
              <div key={app.name} className="p-4 rounded-xl bg-slate-50 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-200 mx-auto mb-3 flex items-center justify-center">
                  <Smartphone size={24} className="text-slate-500" />
                </div>
                <p className="font-medium text-slate-900">{app.name}</p>
                <p className="text-xs text-slate-500">{app.platform}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Setup Modal */}
      <Modal 
        isOpen={isSetupModalOpen} 
        onClose={() => { setIsSetupModalOpen(false); setSetupData(null); }}
        title="Setup Two-Factor Authentication"
        size="lg"
      >
        {setupData && (
          <SetupWizard
            setupData={setupData}
            onConfirm={(code) => confirmMutation.mutate(code)}
            onCancel={() => { setIsSetupModalOpen(false); setSetupData(null); }}
            isConfirming={confirmMutation.isPending}
          />
        )}
      </Modal>

      {/* Disable Modal */}
      <Disable2FAModal
        isOpen={isDisableModalOpen}
        onClose={() => setIsDisableModalOpen(false)}
        onConfirm={(code, password) => disableMutation.mutate({ code, password })}
        isLoading={disableMutation.isPending}
      />

      {/* Regenerate Codes Modal */}
      <RegenerateCodesModal
        isOpen={isRegenerateModalOpen}
        onClose={() => { setIsRegenerateModalOpen(false); setNewBackupCodes(null); }}
        onRegenerate={(code) => regenerateMutation.mutate(code)}
        isLoading={regenerateMutation.isPending}
        newCodes={newBackupCodes}
      />
    </div>
  );
}

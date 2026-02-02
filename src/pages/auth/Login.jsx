import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@/services/authService'
import useAuthStore from '@/stores/useAuthStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { CheckCircle2, Shield } from 'lucide-react'

// Validation Schema
const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const setTokens = useAuthStore((state) => state.setTokens)
    const [isLoading, setIsLoading] = useState(false)
    const [serverError, setServerError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [requires2FA, setRequires2FA] = useState(false)
    const [tempTokens, setTempTokens] = useState(null)
    const [twoFactorCode, setTwoFactorCode] = useState('')
    const [is2FALoading, setIs2FALoading] = useState(false)

    // Check for success message from navigation state
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message)
            // Clear the message from state
            window.history.replaceState({}, document.title)
            // Auto-clear after 10 seconds
            setTimeout(() => setSuccessMessage(''), 10000)
        }
    }, [location])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    })

    const onSubmit = async (data) => {
        setIsLoading(true)
        setServerError('')
        try {
            const response = await authService.login(data.email, data.password)
            console.log('Login response:', response)
            
            // Check if 2FA is required
            if (response.requires_2fa || response.requires_2fa === true) {
                setTempTokens(response)
                setRequires2FA(true)
                setIsLoading(false)
                return
            }
            
            // Normal login without 2FA
            setTokens(response.access, response.refresh)
            navigate('/dashboard')
        } catch (error) {
            console.error(error)
            setServerError(
                error.response?.data?.detail || 'Invalid credentials. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handle2FASubmit = async (e) => {
        e.preventDefault()
        if (twoFactorCode.length !== 6) {
            setServerError('Please enter a 6-digit code')
            return
        }
        
        setIs2FALoading(true)
        setServerError('')
        try {
            await authService.verify2FA(twoFactorCode)
            // After successful 2FA verification, use the tokens
            if (tempTokens) {
                setTokens(tempTokens.access, tempTokens.refresh)
                navigate('/dashboard')
            }
        } catch (error) {
            console.error('2FA verification error:', error)
            setServerError(
                error.response?.data?.error || 'Invalid code. Please try again.'
            )
        } finally {
            setIs2FALoading(false)
        }
    }

    return (
        <div className="min-h-screen flex text-slate-900 bg-white">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10 bg-white">
                <div className="w-full max-w-sm mx-auto space-y-8 animate-fade-in">
                    {/* Brand Header */}
                    <div className="flex justify-center mb-6">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/src/assets/synq.png" alt="syncQ Logo" className="h-28 w-auto object-contain" />
                        </Link>
                    </div>

                    {!requires2FA ? (
                        /* Normal Login Form */
                        <>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
                                <p className="mt-2 text-sm text-slate-500">Sign in to track your career journey</p>
                            </div>

                            {successMessage && (
                                <div className="p-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm border border-emerald-200 flex items-start gap-3">
                                    <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                                    <p>{successMessage}</p>
                                </div>
                            )}

                            {serverError && (
                                <div className="p-3 rounded-md bg-rose-50 text-rose-600 text-sm border border-rose-200">
                                    {serverError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="you@example.com"
                                    error={errors.email}
                                    {...register('email')}
                                    className="bg-white border-slate-300 focus:border-teal-brand-500"
                                />
                                <div className="space-y-1">
                                    <Input
                                        label="Password"
                                        type="password"
                                        placeholder="••••••••"
                                        error={errors.password}
                                        {...register('password')}
                                        className="bg-white border-slate-300 focus:border-teal-brand-500"
                                    />
                                    <div className="flex justify-end">
                                        <Link to="/forgot-password" className="text-sm text-teal-brand-600 hover:text-teal-brand-700 hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full bg-teal-brand-800 hover:bg-teal-brand-900 text-white shadow-lg shadow-teal-brand-900/10" isLoading={isLoading}>
                                    Sign In
                                </Button>
                            </form>

                            <div className="text-center text-sm text-slate-500">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-teal-brand-700 font-semibold hover:text-teal-brand-800 hover:underline">
                                    Sign up
                                </Link>
                            </div>
                        </>
                    ) : (
                        /* 2FA Verification Form */
                        <>
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-100 flex items-center justify-center">
                                    <Shield size={32} className="text-teal-600" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Two-Factor Authentication</h1>
                                <p className="mt-2 text-sm text-slate-500">Enter the 6-digit code from your authenticator app</p>
                            </div>

                            {serverError && (
                                <div className="p-3 rounded-md bg-rose-50 text-rose-600 text-sm border border-rose-200">
                                    {serverError}
                                </div>
                            )}

                            <form onSubmit={handle2FASubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Authentication Code
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={twoFactorCode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '')
                                            setTwoFactorCode(value)
                                            setServerError('')
                                        }}
                                        placeholder="000000"
                                        className="w-full text-center text-2xl font-mono tracking-widest px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-teal-brand-500 focus:ring-4 focus:ring-teal-brand-500/20 outline-none transition-all"
                                        autoFocus
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full bg-teal-brand-800 hover:bg-teal-brand-900 text-white shadow-lg shadow-teal-brand-900/10" 
                                    isLoading={is2FALoading}
                                    disabled={twoFactorCode.length !== 6}
                                >
                                    Verify & Sign In
                                </Button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setRequires2FA(false)
                                        setTwoFactorCode('')
                                        setTempTokens(null)
                                        setServerError('')
                                    }}
                                    className="w-full text-sm text-slate-600 hover:text-slate-900 underline"
                                >
                                    Back to login
                                </button>
                            </form>

                            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                <p className="text-xs text-slate-500 text-center">
                                    Can't access your authenticator? Use one of your backup codes instead.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block relative w-0 flex-1">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="/src/assets/hero-dashboard.png"
                    alt="Dashboard Preview"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-brand-900/40 to-transparent mix-blend-multiply" />
            </div>
        </div>
    )
}

export default Login

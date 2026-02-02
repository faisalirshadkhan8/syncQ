import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { authService } from '@/services/authService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { Mail, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'

// Validation Schema
const schema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain uppercase letter')
        .regex(/[0-9]/, 'Must contain number'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

const Register = () => {
    const [registeredEmail, setRegisteredEmail] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [serverError, setServerError] = useState('')
    const [showVerificationNotice, setShowVerificationNotice] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    })

    // Resend verification mutation
    const resendMutation = useMutation({
        mutationFn: (email) => authService.resendVerification(email),
        onSuccess: () => {
            setServerError('')
        }
    })

    const onSubmit = async (data) => {
        setIsLoading(true)
        setServerError('')
        try {
            const response = await authService.register({
                username: data.username,
                email: data.email,
                password: data.password,
                password_confirm: data.confirmPassword
            })
            console.log('Registration Response:', response)
            console.log('Registration Message:', response.message)
            // Show verification notice instead of redirecting
            setRegisteredEmail(data.email)
            setShowVerificationNotice(true)
        } catch (error) {
            console.error('Registration Error:', error)
            console.error('Error Response:', error.response)
            // Django DRF errors are usually object of arrays { email: ['error'], ... }
            if (error.response?.data) {
                const firstError = Object.values(error.response.data)[0]
                setServerError(Array.isArray(firstError) ? firstError[0] : 'Registration failed.')
            } else {
                setServerError('Something went wrong. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendVerification = () => {
        resendMutation.mutate(registeredEmail)
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

                    {!showVerificationNotice ? (
                        <>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h1>
                                <p className="mt-2 text-sm text-slate-500">Start managing your applications intelligently</p>
                            </div>

                            {serverError && (
                                <div className="p-3 rounded-md bg-rose-50 text-rose-600 text-sm border border-rose-200">
                                    {serverError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <Input
                                    label="Username"
                                    placeholder="johndoe"
                                    error={errors.username}
                                    {...register('username')}
                                    className="bg-white border-slate-300 focus:border-teal-brand-500"
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="you@example.com"
                                    error={errors.email}
                                    {...register('email')}
                                    className="bg-white border-slate-300 focus:border-teal-brand-500"
                                />
                                <div className="space-y-4">
                                    <Input
                                        label="Password"
                                        type="password"
                                        placeholder="••••••••"
                                        error={errors.password}
                                        {...register('password')}
                                        className="bg-white border-slate-300 focus:border-teal-brand-500"
                                    />
                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        placeholder="••••••••"
                                        error={errors.confirmPassword}
                                        {...register('confirmPassword')}
                                        className="bg-white border-slate-300 focus:border-teal-brand-500"
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-teal-brand-800 hover:bg-teal-brand-900 text-white shadow-lg shadow-teal-brand-900/10" isLoading={isLoading}>
                                    Sign Up
                                </Button>
                            </form>

                            <div className="text-center text-sm text-slate-500">
                                Already have an account?{' '}
                                <Link to="/login" className="text-teal-brand-700 font-semibold hover:text-teal-brand-800 hover:underline">
                                    Sign in
                                </Link>
                            </div>
                        </>
                    ) : (
                        /* Email Verification Notice */
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle2 size={40} className="text-emerald-600" />
                            </div>
                            
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    Account Created!
                                </h2>
                                <p className="text-slate-500">
                                    We've sent a verification email to
                                </p>
                                <p className="font-semibold text-slate-900 mt-1">
                                    {registeredEmail}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                                <div className="flex items-start gap-3">
                                    <Mail size={20} className="text-teal-600 shrink-0 mt-0.5" />
                                    <div className="text-sm text-left">
                                        <p className="font-medium text-teal-900 mb-1">Check your inbox</p>
                                        <p className="text-teal-700">
                                            Click the verification link in the email to activate your account.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button 
                                    onClick={handleResendVerification}
                                    variant="secondary" 
                                    className="w-full"
                                    disabled={resendMutation.isPending}
                                >
                                    {resendMutation.isPending ? (
                                        <>
                                            <RefreshCw size={16} className="mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : resendMutation.isSuccess ? (
                                        <>
                                            <CheckCircle2 size={16} className="mr-2" />
                                            Email Sent!
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={16} className="mr-2" />
                                            Resend Verification Email
                                        </>
                                    )}
                                </Button>

                                <Link to="/login">
                                    <Button variant="ghost" className="w-full">
                                        Continue to Login
                                        <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </Link>
                            </div>

                            <p className="text-xs text-slate-500">
                                Didn't receive the email? Check your spam folder.
                            </p>
                        </div>
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

export default Register

import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Input = forwardRef(({
    className,
    label,
    error,
    leftIcon,
    rightIcon,
    type = "text",
    required,
    ...props
}, ref) => {
    // Handle react-hook-form error object or plain string
    const errorMessage = error && typeof error === 'object' ? error.message : error;
    const hasError = !!errorMessage;

    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="text-sm font-bold text-slate-700 ml-1">
                    {label}
                    {required && <span className="text-rose-500 ml-0.5">*</span>}
                </label>
            )}

            <div className="relative">
                {/* Left Icon */}
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        {leftIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    type={type}
                    className={cn(
                        "input",
                        leftIcon && "pl-10",
                        rightIcon && "pr-10",
                        hasError && "input-error",
                        className
                    )}
                    {...props}
                />

                {/* Right Icon */}
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                        {rightIcon}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="flex items-center gap-1.5 ml-1 animate-slide-in-down">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5 text-rose-500"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-xs text-rose-500 font-medium">
                        {errorMessage}
                    </p>
                </div>
            )}
        </div>
    );
});

Input.displayName = "Input";

export default Input;

import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Textarea = forwardRef(({
    className,
    label,
    error,
    ...props
}, ref) => {
    // Handle react-hook-form error object or plain string
    const errorMessage = error && typeof error === 'object' ? error.message : error;
    const hasError = !!errorMessage;

    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="text-sm font-medium text-slate-400 ml-1">
                    {label}
                </label>
            )}

            <textarea
                ref={ref}
                className={cn(
                    "input min-h-[100px] py-3 resize-y",
                    hasError && "input-error",
                    className
                )}
                {...props}
            />

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

Textarea.displayName = "Textarea";

export default Textarea;

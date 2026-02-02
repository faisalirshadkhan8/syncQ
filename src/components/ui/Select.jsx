import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
    className,
    label,
    error,
    options = [],
    placeholder = "Select an option",
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
                </label>
            )}

            <div className="relative">
                <select
                    ref={ref}
                    className={cn(
                        "input appearance-none cursor-pointer pr-10 bg-white text-slate-900 border-slate-200 focus:border-teal-brand-500",
                        hasError && "input-error",
                        className
                    )}
                    {...props}
                >
                    <option value="" disabled className="bg-white text-slate-400">
                        {placeholder}
                    </option>
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="bg-white text-slate-900 py-2"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={16} />
                </div>
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

Select.displayName = "Select";

export default Select;

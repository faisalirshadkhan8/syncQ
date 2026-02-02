import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { useGsapHoverScale } from '@/hooks/useGsap';

const Button = forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    startIcon,
    endIcon,
    children,
    ...props
}, ref) => {

    // Premium hover effect (scale + glow)
    // Only apply to interactive buttons that aren't disabled/loading
    const hoverRef = useGsapHoverScale({
        scale: props.disabled || isLoading ? 1 : 1.02,
        duration: 0.2
    });

    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        ghost: "btn-ghost",
        danger: "btn-danger",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
    };

    return (
        <button
            ref={(node) => {
                // Merit of merging refs: external ref + internal hover ref
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
                hoverRef.current = node;
            }}
            className={cn(
                "btn relative overflow-hidden",
                variants[variant],
                sizes[size],
                (isLoading || props.disabled) && "opacity-70 cursor-not-allowed",
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {/* Loading Spinner */}
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}

            {!isLoading && startIcon && <span className="mr-2">{startIcon}</span>}
            {children}
            {!isLoading && endIcon && <span className="ml-2">{endIcon}</span>}
        </button>
    );
});

Button.displayName = "Button";

export default Button;

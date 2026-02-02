import React from 'react';
import { cn } from '@/utils/cn';

const variants = {
    wishlist: "badge-wishlist",
    applied: "badge-applied",
    interview: "badge-interview",
    offer: "badge-offer",
    rejected: "badge-rejected",
    ghosted: "badge-ghosted",
    success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    error: "bg-rose-100 text-rose-700 border border-rose-200",
    warning: "bg-amber-100 text-amber-700 border border-amber-200",
    info: "bg-blue-100 text-blue-700 border border-blue-200",
    default: "bg-slate-100 text-slate-600 border border-slate-200",
};

const Badge = ({
    className,
    variant = 'default',
    children,
    ...props
}) => {
    return (
        <span
            className={cn(
                "badge",
                variants[variant] || variants.default,
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;

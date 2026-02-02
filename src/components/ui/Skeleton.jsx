import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Skeleton loading placeholder component
 * Uses light theme colors (slate-200/teal) to match the white/green design system
 */
const Skeleton = ({
    className,
    ...props
}) => {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-slate-200",
                className
            )}
            {...props}
        />
    );
};

export default Skeleton;

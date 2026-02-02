import React from 'react';
import { cn } from '@/utils/cn';
import { PackageOpen } from 'lucide-react';
import Button from '@/components/ui/Button';

const EmptyState = ({
    icon = PackageOpen,
    title = "No data found",
    description = "Add a new item to get started.",
    actionLabel,
    onAction,
    className
}) => {
    const Icon = icon;
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white shadow-sm",
            className
        )}>
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <Icon size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 max-w-sm mb-6">{description}</p>

            {actionLabel && onAction && (
                <Button onClick={onAction} className="shadow-lg shadow-teal-brand-900/10">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;

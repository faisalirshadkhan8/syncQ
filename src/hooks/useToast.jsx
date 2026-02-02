import React, { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message, duration = 5000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message, duration }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const success = (message, duration) => addToast('success', message, duration);
    const error = (message, duration) => addToast('error', message, duration);
    const info = (message, duration) => addToast('info', message, duration);
    const warning = (message, duration) => addToast('warning', message, duration);

    return (
        <ToastContext.Provider value={{ success, error, info, warning }}>
            {children}
            {createPortal(
                <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
                    {toasts.map(toast => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onRemove(toast.id);
        }, 300); // Match animation duration
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, toast.duration);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast.duration]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        error: <AlertCircle className="w-5 h-5 text-rose-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        info: <Info className="w-5 h-5 text-indigo-400" />,
    };

    const styles = {
        success: "border-emerald-500 bg-white shadow-lg shadow-emerald-500/10",
        error: "border-rose-500 bg-white shadow-lg shadow-rose-500/10",
        warning: "border-amber-500 bg-white shadow-lg shadow-amber-500/10",
        info: "border-indigo-500 bg-white shadow-lg shadow-indigo-500/10",
    };

    return (
        <div
            className={cn(
                "pointer-events-auto min-w-[300px] max-w-md flex items-center gap-3 p-4 rounded-xl border-l-4 transition-all duration-300",
                styles[toast.type],
                isExiting ? "animate-slide-out-right opacity-0 translate-x-full" : "animate-slide-in-right"
            )}
        >
            <div className="shrink-0">{icons[toast.type]}</div>
            <p className="text-sm font-bold text-slate-900 flex-1">{toast.message}</p>
            <button
                onClick={handleClose}
                className="shrink-0 text-slate-400 hover:text-slate-900 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

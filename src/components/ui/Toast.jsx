'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircleIcon, XCircleIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = (msg) => addToast(msg, 'success');
    const error = (msg) => addToast(msg, 'error');
    const info = (msg) => addToast(msg, 'info');

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info }}>
            {children}
            {createPortal(
                <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none p-4 sm:p-0">
                    <AnimatePresence>
                        {toasts.map((toast) => (
                            <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                        ))}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}

function Toast({ message, type, onClose }) {
    const icons = {
        success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
        error: <XCircleIcon className="w-6 h-6 text-red-500" />,
        info: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
    };

    const bgColors = {
        success: 'bg-white dark:bg-neutral-900 border-green-200 dark:border-green-800',
        error: 'bg-white dark:bg-neutral-900 border-red-200 dark:border-red-800',
        info: 'bg-white dark:bg-neutral-900 border-blue-200 dark:border-blue-800',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`
                pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border
                ${bgColors[type]}
            `}
        >
            <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
            <div className="flex-1 text-sm font-medium text-neutral-900 dark:text-neutral-100 pr-2">
                {message}
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 text-neutral-400 hover:text-neutral-500 transition-colors"
            >
                <XMarkIcon className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

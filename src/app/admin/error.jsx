'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function AdminError({ error, reset }) {
    useEffect(() => {
        console.error('Admin Panel Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">⚠️</span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Something went wrong!
                </h2>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    The admin panel encountered an unexpected error.
                </p>

                <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg mb-6 text-left overflow-auto max-h-32">
                    <code className="text-xs text-red-600 dark:text-red-400 font-mono">
                        {error.message || 'Unknown error code'}
                    </code>
                </div>

                <div className="flex gap-4 justify-center">
                    <Button onClick={() => reset()} variant="primary">
                        Try again
                    </Button>
                    <Button onClick={() => window.location.href = '/'} variant="secondary">
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}

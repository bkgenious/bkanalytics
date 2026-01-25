'use client';

/**
 * Admin Publish Page
 * Trigger deployment to production
 */

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/ui/Button';
import { CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default function PublishPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, success, error
    const [message, setMessage] = useState('');

    const handlePublish = async () => {
        if (!confirm('Are you sure? This will push all current changes to the live website.')) return;

        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const res = await fetch('/api/publish', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to publish');

            setStatus('success');
            setMessage('Publishing started! Your changes will be live in 2-3 minutes.');
        } catch (error) {
            setStatus('error');
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <CloudArrowUpIcon className="w-8 h-8 text-primary-600" />
                        Publish to Production
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Synchronize your Codespaces content with the live website.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 border border-slate-200 dark:border-slate-700">

                    {/* Status Display */}
                    {status === 'success' && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                            <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-green-800 dark:text-green-300">Success</h3>
                                <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
                                <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Area */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                            <h4 className="font-semibold mb-2">How this works:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>All changes in this Codespace are saved.</li>
                                <li>A snapshot of the content (JSON & Uploads) is created.</li>
                                <li>The snapshot is pushed to the main repository.</li>
                                <li>Vercel detects the push and deploys the new version.</li>
                            </ol>
                        </div>

                        <div className="flex justify-center pt-4">
                            <Button
                                onClick={handlePublish}
                                loading={loading}
                                size="xl"
                                className="w-full sm:w-auto min-w-[200px]"
                            >
                                {loading ? 'Publishing...' : '🚀 Publish Now'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { ClockIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const actionColors = {
    CREATE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    LOGIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    BACKUP: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function ActivityPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/activity');
            const json = await res.json();
            if (json.success) {
                setLogs(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch activity logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Log</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Audit trail of admin actions</p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="btn btn-outline btn-sm"
                        disabled={loading}
                    >
                        <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="skeleton h-16 rounded-lg" />
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        <ClockIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No activity recorded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${actionColors[log.action] || 'bg-slate-100'}`}>
                                    {log.action}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {log.resource}
                                        {log.resourceId && (
                                            <span className="text-slate-400 ml-1 text-sm">#{log.resourceId.slice(0, 8)}</span>
                                        )}
                                    </p>
                                    {log.details && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{log.details}</p>
                                    )}
                                </div>
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                    {formatDate(log.timestamp)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

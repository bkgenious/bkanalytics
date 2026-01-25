'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import { ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/metrics');
            const json = await res.json();
            if (json.success) {
                setMetrics(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    // Transform metrics for charts
    const projectsByTool = metrics?.byTool
        ? Object.entries(metrics.byTool).map(([name, value]) => ({ name, value }))
        : [];

    const projectsByStatus = metrics
        ? [
            { name: 'Published', value: metrics.published || 0 },
            { name: 'Draft', value: metrics.drafts || 0 },
        ]
        : [];

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Visual overview of your portfolio metrics
                        </p>
                    </div>
                    <button
                        onClick={fetchMetrics}
                        className="btn btn-outline btn-sm"
                        disabled={loading}
                    >
                        <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="skeleton h-80 rounded-xl" />
                        <div className="skeleton h-80 rounded-xl" />
                    </div>
                ) : !metrics ? (
                    <div className="text-center py-16 text-slate-500">
                        <ChartBarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Could not load metrics.</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <SummaryCard label="Total Projects" value={metrics.totalProjects || 0} />
                            <SummaryCard label="Published" value={metrics.published || 0} color="green" />
                            <SummaryCard label="Drafts" value={metrics.drafts || 0} color="amber" />
                            <SummaryCard label="Tools Used" value={Object.keys(metrics.byTool || {}).length} color="blue" />
                        </div>

                        {/* Charts */}
                        <AnalyticsCharts
                            projectsByTool={projectsByTool}
                            projectsByStatus={projectsByStatus}
                        />
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

function SummaryCard({ label, value, color = 'slate' }) {
    const colorClasses = {
        slate: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    };

    return (
        <div className={`p-4 rounded-xl border border-slate-200 dark:border-slate-700 ${colorClasses[color]}`}>
            <p className="text-sm font-medium opacity-80">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
    );
}

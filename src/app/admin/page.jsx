'use client';

/**
 * Admin Panel - Dashboard and project management
 * Protected by authentication
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    EyeIcon,
    LockClosedIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ChartBarIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

// Login form component
function LoginForm({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Login failed');
            }

            onLogin();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                            <LockClosedIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Admin Panel
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Sign in to manage your portfolio
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="input-enterprise"
                                placeholder="admin"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input-enterprise"
                                placeholder="••••••••"
                            />
                        </div>

                        <Button type="submit" loading={loading} size="lg" className="w-full">
                            Sign In
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        <Link href="/" className="text-primary-600 hover:text-primary-700">
                            ← Back to portfolio
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// Health Check Component
function SystemHealth() {
    const [health, setHealth] = useState(null);

    useEffect(() => {
        fetch('/api/health')
            .then(res => res.json())
            .then(data => setHealth(data))
            .catch(() => setHealth({ server: 'offline' }));
    }, []);

    if (!health) return null;

    const isHealthy = health.server === 'online' &&
        health.checks?.database?.status === 'healthy' &&
        health.checks?.uploads?.writable;

    return (
        <div className={`
            flex items-center px-3 py-1.5 rounded-full text-xs font-medium
            ${isHealthy
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }
        `}>
            {isHealthy ? (
                <CheckCircleIcon className="w-4 h-4 mr-1.5" />
            ) : (
                <ExclamationCircleIcon className="w-4 h-4 mr-1.5" />
            )}
            System {isHealthy ? 'Healthy' : 'Issues'}
        </div>
    );
}

// Metrics Configuration Component
function MetricsConfig() {
    const [config, setConfig] = useState({ experience: 0, customStats: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetch('/api/metrics')
            .then(res => res.json())
            .then(data => {
                setConfig({
                    experience: data.experienceYears,
                    customStats: data.customStats || []
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (!res.ok) throw new Error('Failed to update metrics');

            setMessage({ type: 'success', text: 'Metrics updated successfully' });

            // Clear success message after 3s
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    const addStat = () => {
        setConfig(prev => ({
            ...prev,
            customStats: [...prev.customStats, { label: '', value: '' }]
        }));
    };

    const removeStat = (index) => {
        setConfig(prev => ({
            ...prev,
            customStats: prev.customStats.filter((_, i) => i !== index)
        }));
    };

    const updateStat = (index, field, value) => {
        const newStats = [...config.customStats];
        newStats[index] = { ...newStats[index], [field]: value };
        setConfig(prev => ({ ...prev, customStats: newStats }));
    };

    if (loading) return <div className="animate-pulse h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2 text-primary-600" />
                    Site Metrics Configuration
                </h2>
                {message && (
                    <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {message.text}
                    </span>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Experience */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Years of Experience
                    </label>
                    <input
                        type="number"
                        value={config.experience}
                        onChange={(e) => setConfig({ ...config, experience: Number(e.target.value) })}
                        className="input-enterprise max-w-xs"
                        min="0"
                        step="0.5"
                    />
                </div>

                {/* Custom Stats */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Custom KPI Cards
                        </label>
                        <Button type="button" onClick={addStat} size="sm" variant="outline" icon={PlusIcon}>
                            Add KPI
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {config.customStats.map((stat, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                                <input
                                    type="text"
                                    placeholder="Label (e.g. Clients)"
                                    value={stat.label}
                                    onChange={(e) => updateStat(idx, 'label', e.target.value)}
                                    className="input-enterprise flex-1"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Value (e.g. 50+)"
                                    value={stat.value}
                                    onChange={(e) => updateStat(idx, 'value', e.target.value)}
                                    className="input-enterprise w-32"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removeStat(idx)}
                                    className="p-2 text-slate-400 hover:text-red-500"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        {config.customStats.length === 0 && (
                            <p className="text-sm text-slate-500 italic">No custom KPIs configured.</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" loading={saving}>
                        Save Configuration
                    </Button>
                </div>
            </form>
        </div>
    );
}

// Dashboard component
function Dashboard({ onLogout }) {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [reorderLoading, setReorderLoading] = useState(false);
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        fetchProjects();
        // Poll metrics to update UI when projects change
        fetchMetrics();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            setProjects(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMetrics = async () => {
        try {
            const res = await fetch('/api/metrics');
            const data = await res.json();
            setMetrics(data);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteProject = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        setDeleteLoading(id);
        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProjects(projects.filter((p) => p.id !== id));
                // Update metrics after delete
                fetchMetrics();
            }
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setDeleteLoading(null);
        }
    };

    const moveProject = async (index, direction) => {
        if (reorderLoading) return;
        const newProjects = [...projects];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];

        // Optimistic update
        setProjects(newProjects);
        setReorderLoading(true);

        try {
            await Promise.all([
                fetch(`/api/projects/${newProjects[index].id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...newProjects[index], order: index + 1 })
                }),
                fetch(`/api/projects/${newProjects[targetIndex].id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...newProjects[targetIndex], order: targetIndex + 1 })
                })
            ]);

            await fetchProjects();

        } catch (error) {
            console.error('Reorder error:', error);
            await fetchProjects();
        } finally {
            setReorderLoading(false);
        }
    };

    return (
        <AdminLayout onLogout={onLogout}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-4">
                        Dashboard
                        <SystemHealth />
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage your portfolio projects
                    </p>
                </div>
                <Link href="/admin/projects/new">
                    <Button icon={PlusIcon}>New Project</Button>
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {[
                    { label: 'Total Projects', value: metrics?.totalProjects ?? '-', color: 'primary' },
                    { label: 'Published', value: projects.filter(p => p.status === 'published').length, color: 'green' },
                    { label: 'Drafts', value: projects.filter(p => p.status === 'draft').length, color: 'amber' },
                    { label: 'Media Files', value: metrics?.totalMedia ?? '-', color: 'blue' },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm"
                    >
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                            {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Codespaces File Persistence Warning */}
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-start">
                    <ExclamationCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            GitHub Codespaces Notice
                        </h3>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                            Uploaded files exist only in this workspace. To persist them, commit to Git:
                            <code className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded text-xs font-mono">
                                {`git add public/uploads/ && git commit -m "Add uploads" && git push`}
                            </code>
                        </p>
                    </div>
                </div>
            </div>

            {/* Two Column Layout: Metrics Config & Project List */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left: Project List (Takes 2 cols on large screens) */}
                <div className="xl:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                All Projects
                            </h2>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-6xl mb-4">📊</div>
                                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    No projects yet
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">
                                    Create your first project to get started
                                </p>
                                <Link href="/admin/projects/new">
                                    <Button icon={PlusIcon}>Create Project</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                {projects.map((project, index) => (
                                    <motion.div
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${project.status === 'draft' ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}
                                    >
                                        {/* Reorder Controls */}
                                        <div className="flex flex-col mr-4 gap-1">
                                            <button
                                                onClick={() => moveProject(index, 'up')}
                                                disabled={index === 0 || reorderLoading}
                                                className="p-1 text-slate-400 hover:text-primary-600 disabled:opacity-20 disabled:cursor-not-allowed"
                                            >
                                                <ArrowUpIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => moveProject(index, 'down')}
                                                disabled={index === projects.length - 1 || reorderLoading}
                                                className="p-1 text-slate-400 hover:text-primary-600 disabled:opacity-20 disabled:cursor-not-allowed"
                                            >
                                                <ArrowDownIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Thumbnail */}
                                        <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-600 mr-4 relative">
                                            {project.thumbnail || project.images?.[0] ? (
                                                <Image
                                                    src={project.thumbnail || project.images[0]}
                                                    alt={project.title}
                                                    width={80}
                                                    height={56}
                                                    className={`w-full h-full object-cover ${project.status === 'draft' ? 'grayscale opacity-70' : ''}`}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                                    📊
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-slate-900 dark:text-white truncate flex items-center gap-2">
                                                {project.title}
                                                {project.status === 'draft' && (
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-xs font-medium">
                                                        Draft
                                                    </span>
                                                )}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge tool={project.tool} size="sm" />
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(project.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Link href={`/projects/${project.id}`} target="_blank">
                                                <button className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors">
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                            </Link>
                                            <Link href={`/admin/projects/${project.id}/edit`}>
                                                <button className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors">
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => deleteProject(project.id)}
                                                disabled={deleteLoading === project.id}
                                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {deleteLoading === project.id ? (
                                                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <TrashIcon className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Metrics Configuration */}
                <div className="xl:col-span-1">
                    <MetricsConfig />
                </div>

            </div>
        </AdminLayout>
    );
}

// Main admin page
export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth');
                const data = await res.json();
                setAuthenticated(data.authenticated);
            } catch (error) {
                setAuthenticated(false);
            } finally {
                setChecking(false);
            }
        };

        checkAuth();
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!authenticated) {
        return <LoginForm onLogin={() => setAuthenticated(true)} />;
    }

    return <Dashboard onLogout={() => setAuthenticated(false)} />;
}

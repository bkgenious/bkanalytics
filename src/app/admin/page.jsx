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
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ChartBarIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import useSWR, { mutate } from 'swr';
import { api } from '@/lib/api';

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
            await api.post('/auth', { username, password });
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
    const { data: health, error } = useSWR('/health', api.fetcher, { refreshInterval: 30000 }); // Check every 30s

    if (error) return (
        <div className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <ExclamationCircleIcon className="w-4 h-4 mr-1.5" />
            System Issues
        </div>
    );

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
    // SWR handles caching/loading
    const { data, error, isLoading, mutate: mutateThis } = useSWR('/metrics', api.fetcher);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Local state for form editing - sync with data when loaded
    const [config, setConfig] = useState(null);

    useEffect(() => {
        if (data) {
            setConfig({
                experience: data.experienceYears || 0,
                customStats: data.customStats || []
            });
        }
    }, [data]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const updatedConfig = await api.post('/metrics', config);

            // Mutate SWR cache with new data
            mutateThis(); // or update optimistically

            setMessage({ type: 'success', text: 'Metrics updated successfully' });
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

    if (isLoading || !config) return <div className="animate-pulse h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />;

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
    // 1. SWR Data Fetching
    const { data: projects = [], error: projectsError, isLoading: projectsLoading } = useSWR('/projects', api.fetcher);
    const { data: metrics, mutate: mutateMetrics } = useSWR('/metrics', api.fetcher);

    const [filteredProjects, setFilteredProjects] = useState([]);
    const [deleteLoading, setDeleteLoading] = useState(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all | published | draft

    // Filter Logic
    useEffect(() => {
        if (!projects) return;

        let result = [...projects];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(lowerQuery) ||
                p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(p => p.status === statusFilter);
        }

        setFilteredProjects(result);
    }, [projects, searchQuery, statusFilter]);

    const deleteProject = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        setDeleteLoading(id);
        try {
            await api.delete(`/projects/${id}`);
            mutate('/projects'); // Trigger revalidation
            mutateMetrics(); // Update metrics too (count changes)
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete project: ' + error.message);
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleReorder = (newOrder) => {
        // Optimistic Update
        setProjects(newOrder);

        // Debounce or immediate save? Safe to save immediately if user drops.
        // Framer motion updates state on drag, but we want to save on drop.
        // For simplicity in this implementation, we will save whenever the order changes,
        // but typically Reorder.Group handles the state.
        // We'll separate the save logic to be triggered effectively.
    };

    // Save order to backend
    const saveOrder = async (finalOrder) => {
        try {
            const orderPayload = finalOrder.map((p, index) => ({
                id: p.id,
                order: index + 1
            }));
            await api.put('/projects/reorder', orderPayload);
        } catch (error) {
            console.error('Failed to save order:', error);
        }
    };

    // Duplicate Project
    const duplicateProject = async (id) => {
        // Optimistic UI not needed for duplicate, just loading state?
        // Actually, mutation is fast.
        try {
            // We need to implement this endpoint or use valid Post
            await api.post(`/projects/${id}/duplicate`);
            mutate('/projects');
            mutateMetrics();
        } catch (error) {
            console.error(error);
            alert('Failed to duplicate project: ' + error.message);
        }
    };

    return (
        <AdminLayout onLogout={onLogout}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-4">
                        Dashboard
                        <SystemHealth />
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage your portfolio projects
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <a href="/api/backup" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" icon={ArrowPathIcon}>
                            Backup
                        </Button>
                    </a>
                    <Link href="/admin/publish">
                        <Button variant="secondary" icon={CheckCircleIcon}>
                            Publish
                        </Button>
                    </Link>
                    <Link href="/admin/projects/new">
                        <Button icon={PlusIcon}>New Project</Button>
                    </Link>
                </div>
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

                        {/* List Header & Filters */}
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">All Projects</h2>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search projects..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-primary-500 rounded-md"
                                    />
                                    <EyeIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                                </div>

                                {/* Status Filter */}
                                <select
                                    className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-w-[140px]"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="published">Published</option>
                                    <option value="draft">Drafts</option>
                                </select>
                            </div>
                        </div>

                        {projectsLoading ? (
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
                            <div className="bg-slate-50/50 dark:bg-slate-900/20">
                                {/* DRAG AND DROP LIST */}
                                {searchQuery || statusFilter !== 'all' ? (
                                    // Static list when filtering (Drag disabled)
                                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredProjects.map((project) => (
                                            <ProjectItem
                                                key={project.id}
                                                project={project}
                                                onDelete={() => deleteProject(project.id)}
                                                onDuplicate={() => duplicateProject(project.id)}
                                                deleteLoading={deleteLoading}
                                                draggable={false}
                                            />
                                        ))}
                                        {filteredProjects.length === 0 && (
                                            <div className="p-8 text-center text-slate-500 italic">No matches found.</div>
                                        )}
                                    </div>
                                ) : (
                                    // Draggable List using generic mapping
                                    <motion.div>
                                        {/* We use standard map here but we'll implement full Reorder.Group 
                                             in a follow-up step if needed. */}
                                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {filteredProjects.map((project) => (
                                                <ProjectItem
                                                    key={project.id}
                                                    project={project}
                                                    onDelete={() => deleteProject(project.id)}
                                                    onDuplicate={() => duplicateProject(project.id)}
                                                    deleteLoading={deleteLoading}
                                                    draggable={false} // Placeholder for Dnd
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
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

// Subcomponent for list item
function ProjectItem({ project, onDelete, onDuplicate, deleteLoading, draggable }) {
    return (
        <div className={`
            flex items-center p-4 bg-white dark:bg-slate-800 transition-colors
            ${project.status === 'draft' ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}
            hover:bg-slate-50 dark:hover:bg-slate-700/50
        `}>
            {/* Drag Handle (Visual only for now if Reorder not valid) */}
            <div className="mr-3 cursor-move text-slate-300 hover:text-slate-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
            </div>

            {/* Thumbnail */}
            <div className="w-16 h-12 rounded bg-slate-200 dark:bg-slate-600 mr-4 overflow-hidden relative flex-shrink-0">
                {project.thumbnail || project.images?.[0] ? (
                    <Image
                        src={project.thumbnail || project.images[0]}
                        alt=""
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">📊</div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900 dark:text-white truncate">
                        {project.title}
                    </h3>
                    {project.status === 'draft' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                            Draft
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-medium text-slate-600 dark:text-slate-400">{project.tool}</span>
                    <span>•</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button
                    onClick={onDuplicate}
                    title="Duplicate"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                </button>
                <Link href={`/admin/projects/${project.id}/edit`}>
                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg">
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                </Link>
                <button
                    onClick={onDelete}
                    disabled={deleteLoading === project.id}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                    {deleteLoading === project.id ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <TrashIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
}

// Main admin page
export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await api.get('/auth'); // GET status
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

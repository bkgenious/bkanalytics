'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/ui/Button';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { success, error: toastError } = useToast();
    const LIMIT = 10;

    const fetchProjects = useCallback(async (pageNum, isReset) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                limit: LIMIT.toString(),
                page: pageNum.toString(),
                sort: 'date-desc'
            });

            if (debouncedSearch) params.set('search', debouncedSearch);
            if (statusFilter !== 'all') params.set('status', statusFilter);

            const res = await fetch(`/api/projects?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                const newProjects = data.data;
                setProjects(prev => isReset ? newProjects : [...prev, ...newProjects]);
                setHasMore(newProjects.length === LIMIT);
            }
        } catch (error) {
            console.error('Failed to fetch projects', error);
            toastError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, statusFilter, toastError]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch on Filter Change (Reset)
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchProjects(1, true);
    }, [debouncedSearch, statusFilter, fetchProjects]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProjects(nextPage, false);
    };

    async function handleDelete(id) {
        if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProjects(prev => prev.filter(p => p.id !== id));
                success('Project deleted');
            } else {
                toastError('Failed to delete project');
            }
        } catch (error) {
            console.error(error);
            toastError('Error deleting project');
        }
    }

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage your portfolio case studies</p>
                </div>
                <Link href="/admin/projects/new">
                    <Button icon={PlusIcon}>New Project</Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'published', 'draft'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === status
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {loading && page === 1 ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-4">
                            <Skeleton className="w-16 h-16 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500">No projects found. Create one to get started.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-4">
                        {projects.map(project => (
                            <div key={project.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
                                {/* Thumbnail or Placeholder */}
                                <div className="w-16 h-16 shrink-0 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
                                    {project.thumbnail ? (
                                        <Image
                                            src={project.thumbnail}
                                            alt={project.title}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <EyeIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{project.title}</h3>
                                    <p className="text-sm text-slate-500 truncate">{project.description}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${project.status === 'published'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                            {project.status}
                                        </span>
                                        <span className="text-xs text-slate-400 px-2 border-l border-slate-200 dark:border-slate-700">
                                            {project.tool}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={`/projects/${project.id}`}
                                        target="_blank"
                                        className="p-2 text-slate-400 hover:text-primary-500 transition-colors"
                                        title="View Live"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        href={`/admin/projects/${project.id}/edit`}
                                        className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                                        title="Edit"
                                    >
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center pb-4">
                            <Button
                                variant="outline"
                                onClick={handleLoadMore}
                                loading={loading}
                            >
                                Load More Projects
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}

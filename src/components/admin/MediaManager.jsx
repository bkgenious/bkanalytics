'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
    TrashIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    DocumentIcon,
    VideoCameraIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';
import FileDropzone from '@/components/admin/FileDropzone';
import { useApiError } from '@/hooks/useApiError';
import Skeleton from '@/components/ui/Skeleton';

import { useToast } from '@/components/ui/Toast';

export default function MediaManager() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { handleError } = useApiError();
    const { success, error: toastError } = useToast();

    // Fetch files
    const fetchMedia = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch('/api/media');
            const data = await res.json();
            if (data.success) {
                setFiles(data.data);
            } else {
                setFiles([]);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            handleError(new Error('Failed to load media'));
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [handleError]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleDelete = async (filePath) => {
        if (!confirm('Are you sure you want to delete this file?\nThis action cannot be undone.')) return;

        try {
            const res = await fetch('/api/media', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath })
            });
            const data = await res.json();

            if (data.success) {
                setFiles(prev => prev.filter(f => f.path !== filePath));
                success('File deleted successfully');
            } else {
                toastError(data.error?.message || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toastError('Failed to delete file');
        }
    };

    const handleUploadComplete = () => {
        fetchMedia(); // Refresh list after upload
    };

    // Filter Logic
    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = filter === 'all' || file.type === filter;
        return matchesSearch && matchesType;
    });

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Upload Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Upload New Media</h2>
                <FileDropzone
                    onFilesUploaded={handleUploadComplete}
                    existingFiles={{}}
                />
            </div>

            {/* Gallery Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Library</h2>
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-medium">
                            {files.length}
                        </span>
                        <button
                            onClick={fetchMedia}
                            disabled={isRefreshing}
                            className={`p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:w-64">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            />
                        </div>

                        {/* Filter Toggles */}
                        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                            {['all', 'image', 'video', 'document'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${filter === type
                                        ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="p-6">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} className="aspect-square rounded-xl" />
                            ))}
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500 dark:text-slate-400">No media found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredFiles.map(file => (
                                <div key={file.path} className="group relative bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Usage Indicator */}
                                    {file.isUsed && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200 dark:border-green-800">
                                                IN USE
                                            </span>
                                        </div>
                                    )}

                                    {/* Preview */}
                                    <div className="aspect-square relative flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                        {file.type === 'image' ? (
                                            <Image
                                                src={file.path}
                                                alt={file.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 50vw, 20vw"
                                            />
                                        ) : file.type === 'video' ? (
                                            <VideoCameraIcon className="w-12 h-12 text-slate-400" />
                                        ) : (
                                            <DocumentIcon className="w-12 h-12 text-slate-400" />
                                        )}

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <a
                                                href={file.path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-white/90 rounded-full hover:scale-110 transition-transform"
                                                title="View/Download"
                                            >
                                                <MagnifyingGlassIcon className="w-5 h-5 text-slate-700" />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(file.path)}
                                                disabled={file.isUsed}
                                                className={`p-2 rounded-full hover:scale-110 transition-transform ${file.isUsed
                                                    ? 'bg-slate-200 cursor-not-allowed opacity-50'
                                                    : 'bg-red-500 text-white'
                                                    }`}
                                                title={file.isUsed ? 'Cannot delete used file' : 'Delete'}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={file.name}>
                                            {file.name}
                                        </p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-slate-500 uppercase">{file.type}</span>
                                            <span className="text-xs text-slate-400">{formatSize(file.size)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

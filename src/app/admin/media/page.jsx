'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import MediaManager from '@/components/admin/MediaManager';

export default function MediaPage() {
    return (
        <AdminLayout>
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Media Library</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage all uploaded images, videos, and documents.
                    </p>
                </div>
                <MediaManager />
            </div>
        </AdminLayout>
    );
}

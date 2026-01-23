'use client';

/**
 * New Project Page
 * Create a new project with form and file uploads
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ProjectForm from '@/components/admin/ProjectForm';

export default function NewProjectPage() {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth');
                const data = await res.json();
                if (!data.authenticated) {
                    router.push('/admin');
                    return;
                }
                setAuthenticated(true);
            } catch (error) {
                router.push('/admin');
            } finally {
                setChecking(false);
            }
        };

        checkAuth();
    }, [router]);

    if (checking || !authenticated) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <AdminLayout onLogout={() => router.push('/admin')}>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Create New Project
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Fill in the details and upload files for your new project
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8">
                    <ProjectForm />
                </div>
            </div>
        </AdminLayout>
    );
}

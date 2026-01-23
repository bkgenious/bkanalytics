'use client';

/**
 * Edit Project Page
 * Edit an existing project
 */

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ProjectForm from '@/components/admin/ProjectForm';

export default function EditProjectPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            try {
                // Check auth
                const authRes = await fetch('/api/auth');
                const authData = await authRes.json();
                if (!authData.authenticated) {
                    router.push('/admin');
                    return;
                }
                setAuthenticated(true);

                // Fetch project
                const projectRes = await fetch(`/api/projects/${id}`);
                if (!projectRes.ok) {
                    router.push('/admin');
                    return;
                }
                const projectData = await projectRes.json();
                setProject(projectData);
            } catch (error) {
                console.error('Error:', error);
                router.push('/admin');
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetch();
    }, [id, router]);

    if (loading || !authenticated) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <AdminLayout onLogout={() => router.push('/admin')}>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Edit Project
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Update the details and files for &ldquo;{project.title}&rdquo;
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8">
                    <ProjectForm project={project} />
                </div>
            </div>
        </AdminLayout>
    );
}

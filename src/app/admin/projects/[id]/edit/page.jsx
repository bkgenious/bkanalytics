'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react'; // Handling params in client components
import AdminLayout from '@/components/admin/AdminLayout';
import ProjectForm from '@/components/admin/ProjectForm';

export default function EditProjectPage({ params }) {
    const router = useRouter();
    // In Next.js 15, params is a Promise. In 14, it's object or promise? 
    // The previous code in route handlers treated it as awaitable (await params).
    // In client components, it works differently depending on version.
    // To be safe, let's assume we can access it directly if we unwrap it or if it's passed as prop.
    // If we use `use(params)` it handles the promise if it is one. 
    // But `use` is React canary. 
    // Let's rely on standard async unwrapping if needed or direct access.
    // Actually, let's just use `useEffect` to unwrap/fetch if needed, or simply `params.id`
    // If params is a promise in this version (Next 15), we need React.use() or await in server component.
    // This is 'use client'.

    // Simplest compat strategy:
    const [projectId, setProjectId] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Unwrap params safely
        Promise.resolve(params).then(p => {
            setProjectId(p.id);
        });
    }, [params]);

    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}`);
                const json = await res.json();

                if (json.success) {
                    setProject(json.data);
                } else {
                    setError(json.error?.message || 'Failed to load project');
                }
            } catch (err) {
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
                    <h2 className="text-xl font-bold mb-2">Error Loading Project</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => router.push('/admin/projects')}
                        className="mt-4 px-4 py-2 bg-white dark:bg-red-900/40 rounded-lg text-sm font-medium shadow-sm hover:shadow"
                    >
                        Back to Projects
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <ProjectForm project={project} isEditing={true} />
            </div>
        </AdminLayout>
    );
}

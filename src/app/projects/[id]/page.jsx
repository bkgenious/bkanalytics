'use client';

/**
 * Project Detail Page
 * Case study layout with enterprise-grade presentation
 */

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Badge, { TagBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import {
    ArrowLeftIcon,
    DocumentArrowDownIcon,
    PlayCircleIcon,
    CalendarIcon,
    TagIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function ProjectPage() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                // Fetch project data
                const res = await fetch(`/api/projects/${id}`);
                if (!res.ok) throw new Error('Project not found');
                const data = await res.json();

                // Check draft status
                if (data.status === 'draft') {
                    // Check authentication
                    try {
                        const authRes = await fetch('/api/auth');
                        const auth = await authRes.json();
                        if (!auth.authenticated) {
                            // If not authenticated, redirect to home (simulate 404 behavior for public)
                            // or we could show a true 404 component
                            router.replace('/');
                            return;
                        }
                    } catch (e) {
                        router.replace('/');
                        return;
                    }
                }

                setProject(data);
            } catch (error) {
                console.error(error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const openLightbox = useCallback((index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    }, []);

    const nextImage = useCallback(() => {
        if (project?.images) {
            setCurrentImageIndex(prev => (prev + 1) % project.images.length);
        }
    }, [project]);

    const prevImage = useCallback(() => {
        if (project?.images) {
            setCurrentImageIndex(prev => (prev - 1 + project.images.length) % project.images.length);
        }
    }, [project]);

    // Loading State
    if (loading) {
        return (
            <main className="min-h-screen bg-white dark:bg-neutral-950">
                <Header />
                <div className="pt-32 pb-20 max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="skeleton h-4 w-24 rounded mb-8" />
                        <div className="skeleton h-6 w-20 rounded mb-4" />
                        <div className="skeleton h-12 w-3/4 rounded mb-4" />
                        <div className="skeleton h-5 w-full max-w-2xl rounded mb-8" />
                        <div className="skeleton aspect-video rounded-lg" />
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    if (!project) return null;

    const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });

    return (
        <main className="min-h-screen bg-white dark:bg-neutral-950">
            <Header />

            <article className="pt-32 pb-20">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">

                    {/* Back Navigation */}
                    <div className="animate-fade-in mb-10 flex justify-between items-center">
                        <Link
                            href="/"
                            className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Work
                        </Link>

                        {project.status === 'draft' && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                                Draft Preview
                            </span>
                        )}
                    </div>

                    {/* Header Section */}
                    <header className="mb-12 animate-slide-up">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                            <Badge tool={project.tool} />
                            {project.tags?.map(tag => (
                                <TagBadge key={tag} tag={tag} />
                            ))}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight mb-5">
                            {project.title}
                        </h1>

                        {/* Description */}
                        <p className="text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-3xl">
                            {project.description}
                        </p>
                    </header>

                    {/* Main Image Gallery */}
                    {project.images?.length > 0 && (
                        <section className="mb-12 animate-fade-up" style={{ animationDelay: '100ms' }}>
                            {/* Primary Image */}
                            <button
                                onClick={() => openLightbox(0)}
                                className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer group border border-neutral-200 dark:border-neutral-800 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                            >
                                <Image
                                    src={project.images[0]}
                                    alt={project.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                    priority
                                />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium text-white bg-neutral-900/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                                        Click to expand
                                    </span>
                                </div>
                            </button>

                            {/* Thumbnail Strip */}
                            {project.images.length > 1 && (
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 mt-3">
                                    {project.images.slice(1).map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => openLightbox(index + 1)}
                                            className="relative aspect-video rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-400 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500"
                                        >
                                            <Image
                                                src={img}
                                                alt={`${project.title} - Image ${index + 2}`}
                                                fill
                                                className="object-cover"
                                                loading="lazy"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Video Section */}
                    {project.video && (
                        <section className="mb-12 animate-fade-up" style={{ animationDelay: '200ms' }}>
                            <h2 className="flex items-center text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                                <PlayCircleIcon className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                                Demo
                            </h2>
                            <div className="aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                <video
                                    src={project.video}
                                    controls
                                    className="w-full h-full"
                                    poster={project.images?.[0]}
                                    preload="metadata"
                                />
                            </div>
                        </section>
                    )}

                    {/* Documents & PDF Section */}
                    {(project.pdf || (project.documents && project.documents.length > 0)) && (
                        <section className="mb-12 animate-fade-up" style={{ animationDelay: '250ms' }}>
                            <h2 className="flex items-center text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                                <DocumentTextIcon className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                                Project Resources
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Main PDF Report */}
                                {project.pdf && (
                                    <div className="flex items-center justify-between p-5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4">
                                                <DocumentArrowDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-neutral-900 dark:text-white">
                                                    Full Report
                                                </h3>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    PDF Format
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={project.pdf}
                                            download
                                            className="btn btn-outline btn-sm"
                                        >
                                            Download
                                        </a>
                                    </div>
                                )}

                                {/* Additional Documents */}
                                {project.documents?.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                                                <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0 pr-2">
                                                <h3 className="font-medium text-neutral-900 dark:text-white truncate">
                                                    {doc.split('/').pop().replace(/^\d+-[a-f0-9]+-/, '').substring(0, 30)}...
                                                </h3>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400 uppercase">
                                                    {doc.split('.').pop()} File
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={doc}
                                            download
                                            className="btn btn-outline btn-sm shrink-0"
                                        >
                                            Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Metadata Section */}
                    <section className="pt-10 border-t border-neutral-200 dark:border-neutral-800 animate-fade-up" style={{ animationDelay: '300ms' }}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            {/* Tool */}
                            <div>
                                <h3 className="flex items-center text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                                    Tool
                                </h3>
                                <Badge tool={project.tool} />
                            </div>

                            {/* Date */}
                            <div>
                                <h3 className="flex items-center text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                                    <CalendarIcon className="w-4 h-4 mr-1.5" />
                                    Date
                                </h3>
                                <p className="text-neutral-900 dark:text-white font-medium">
                                    {formattedDate}
                                </p>
                            </div>

                            {/* Tags */}
                            <div>
                                <h3 className="flex items-center text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                                    <TagIcon className="w-4 h-4 mr-1.5" />
                                    Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags?.length > 0 ? (
                                        project.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="text-sm text-neutral-600 dark:text-neutral-300"
                                            >
                                                #{tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-neutral-400">—</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Navigation to other projects */}
                    <section className="mt-16 pt-10 border-t border-neutral-200 dark:border-neutral-800">
                        <div className="text-center">
                            <p className="text-sm text-neutral-500 mb-4">Ready to see more?</p>
                            <Link
                                href="/#projects"
                                className="btn btn-outline btn-md inline-flex items-center group"
                            >
                                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                View All Projects
                            </Link>
                        </div>
                    </section>
                </div>
            </article>

            {/* Lightbox Modal */}
            <Modal
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                images={project?.images || []}
                currentIndex={currentImageIndex}
                onNext={nextImage}
                onPrevious={prevImage}
            />

            <Footer />
        </main>
    );
}

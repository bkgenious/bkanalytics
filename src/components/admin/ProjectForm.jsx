'use client';

/**
 * Project form component for creating/editing projects
 * Includes all fields and file upload
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import FileDropzone from './FileDropzone';
import { TagBadge } from '@/components/ui/Badge';
import Toggle from '@/components/ui/Toggle';
import { PlusIcon } from '@heroicons/react/24/outline';

const TOOLS = ['Power BI', 'Tableau', 'Excel'];

export default function ProjectForm({ project = null, onSuccess }) {
    const router = useRouter();
    const isEditing = !!project;

    const [formData, setFormData] = useState({
        title: project?.title || '',
        description: project?.description || '',
        tool: project?.tool || 'Power BI',
        tags: project?.tags || [],
        status: project?.status || 'published',
        order: project?.order || 0,
    });

    const [files, setFiles] = useState({
        images: project?.images || [],
        videos: project?.video ? [project.video] : [],
        pdfs: project?.pdf ? [project.pdf] : [],
        documents: project?.documents || [],
    });

    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle files uploaded
    const handleFilesUploaded = (uploadedFiles) => {
        setFiles(uploadedFiles);
    };

    // Add a tag
    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag)) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, tag],
            }));
            setTagInput('');
        }
    };

    // Remove a tag
    const removeTag = (tagToRemove) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                tool: formData.tool,
                tags: formData.tags,
                status: formData.status,
                order: parseInt(formData.order) || 0,
                // Files
                images: files.images,
                video: files.videos[0] || null,
                pdf: files.pdfs[0] || null,
                thumbnail: files.images[0] || null,
                documents: files.documents,
            };

            const url = isEditing ? `/api/projects/${project.id}` : '/api/projects';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save project');
            }

            onSuccess?.();
            router.push('/admin');
            router.refresh();
        } catch (err) {
            console.error('Save error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-8"
        >
            {/* Error message */}
            {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content - Left Column */}
                <div className="md:col-span-2 space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Project Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="input-enterprise"
                            placeholder="Enter project title..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={6}
                            className="input-enterprise resize-none"
                            placeholder="Describe your project..."
                        />
                    </div>

                    {/* File upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Project Files (Images, Videos, PDFs, Docs)
                        </label>
                        <FileDropzone
                            onFilesUploaded={handleFilesUploaded}
                            existingFiles={files}
                        />
                    </div>
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    {/* Status & Settings card */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl space-y-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Publishing</h3>

                        {/* Status Toggle */}
                        <Toggle
                            label="Published"
                            description="Visible to public"
                            checked={formData.status === 'published'}
                            onChange={(checked) => setFormData(prev => ({ ...prev, status: checked ? 'published' : 'draft' }))}
                        />

                        {/* Order */}
                        <div>
                            <label htmlFor="order" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Display Order
                            </label>
                            <input
                                type="number"
                                id="order"
                                name="order"
                                value={formData.order}
                                onChange={handleChange}
                                className="input-enterprise"
                                min="0"
                            />
                            <p className="text-xs text-slate-500 mt-1">Lower numbers appear first</p>
                        </div>
                    </div>

                    {/* Tool selection */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl space-y-4">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                            Tool Used *
                        </label>
                        <div className="flex flex-col gap-2">
                            {TOOLS.map((tool) => (
                                <button
                                    key={tool}
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, tool }))}
                                    className={`
                                        px-4 py-3 rounded-lg font-medium transition-all duration-200 text-left flex items-center
                                        ${formData.tool === tool
                                            ? 'bg-primary-600 text-white shadow-md'
                                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                                        }
                                    `}
                                >
                                    <span className="mr-2">
                                        {tool === 'Power BI' && '📊'}
                                        {tool === 'Tableau' && '📈'}
                                        {tool === 'Excel' && '📑'}
                                    </span>
                                    {tool}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl space-y-4">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                            Tags
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="input-enterprise flex-1 min-w-0"
                                placeholder="Add tag..."
                            />
                            <Button type="button" onClick={addTag} size="sm" icon={PlusIcon}>
                                Add
                            </Button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {formData.tags.map((tag) => (
                                    <TagBadge key={tag} tag={tag} onRemove={removeTag} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                    type="submit"
                    loading={loading}
                    size="lg"
                >
                    {isEditing ? 'Update Project' : 'Create Project'}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => router.push('/admin')}
                >
                    Cancel
                </Button>
            </div>
        </motion.form>
    );
}

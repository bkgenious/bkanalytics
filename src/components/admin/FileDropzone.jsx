'use client';

/**
 * Drag & drop file upload zone component
 * Supports images, videos, PDFs, and Documents (DOC/DOCX/TXT)
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    CloudArrowUpIcon,
    XMarkIcon,
    DocumentIcon,
    PlayIcon,
    PhotoIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function FileDropzone({
    onFilesUploaded,
    accept = 'image/*,video/*,.pdf,.doc,.docx,.txt',
    multiple = true,
    existingFiles = { images: [], videos: [], pdfs: [], documents: [] }
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [files, setFiles] = useState(existingFiles);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    // Handle drag events
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // Upload files to server
    const uploadFiles = useCallback(async (fileList) => {
        setUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const formData = new FormData();

            for (let i = 0; i < fileList.length; i++) {
                formData.append('files', fileList[i]);
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();

            // Merge with existing files
            setFiles(prevFiles => {
                const newFiles = {
                    images: [...(prevFiles.images || []), ...(result.images || [])],
                    videos: [...(prevFiles.videos || []), ...(result.videos || [])],
                    pdfs: [...(prevFiles.pdfs || []), ...(result.pdfs || [])],
                    documents: [...(prevFiles.documents || []), ...(result.documents || [])],
                };
                onFilesUploaded?.(newFiles);
                return newFiles;
            });

            if (result.errors?.length > 0) {
                setError(`Some files failed: ${result.errors.map(e => e.file).join(', ')}`);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload files. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(100);
        }
    }, [onFilesUploaded]);

    // Handle file drop
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer?.files;
        if (droppedFiles && droppedFiles.length > 0) {
            uploadFiles(droppedFiles);
        }
    }, [uploadFiles]);

    // Handle file input change
    const handleFileChange = (e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            uploadFiles(selectedFiles);
        }
    };

    // Remove a file
    const removeFile = (type, index) => {
        const newFiles = { ...files };
        if (newFiles[type]) {
            newFiles[type].splice(index, 1);
            setFiles(newFiles);
            onFilesUploaded?.(newFiles);
        }
    };

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
                    }
          ${uploading ? 'pointer-events-none opacity-70' : ''}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <CloudArrowUpIcon className={`
          w-12 h-12 mx-auto mb-4
          ${isDragging ? 'text-primary-500' : 'text-slate-400'}
        `} />

                {uploading ? (
                    <div>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">Uploading...</p>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                className="h-full bg-primary-600 rounded-full"
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-600 dark:text-slate-300 mb-2">
                            <span className="font-medium text-primary-600 dark:text-primary-400">Click to upload</span>
                            {' '}or drag and drop
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Images, Videos, PDFs, Documents
                        </p>
                    </>
                )}
            </div>

            {/* Error message */}
            {error && (
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            )}

            {/* File previews */}
            <AnimatePresence>
                {/* Images */}
                {files.images?.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                            <PhotoIcon className="w-4 h-4 mr-2" />
                            Images ({files.images.length})
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                            {files.images.map((src, idx) => (
                                <motion.div
                                    key={src}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative aspect-video rounded-lg overflow-hidden group"
                                >
                                    <Image
                                        src={src}
                                        alt={`Image ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile('images', idx);
                                        }}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Videos */}
                {files.videos?.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                            <PlayIcon className="w-4 h-4 mr-2" />
                            Videos ({files.videos.length})
                        </h4>
                        <div className="space-y-2">
                            {files.videos.map((src, idx) => (
                                <motion.div
                                    key={src}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
                                >
                                    <div className="flex items-center">
                                        <PlayIcon className="w-5 h-5 mr-2 text-primary-600" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-xs">
                                            {src.split('/').pop()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeFile('videos', idx)}
                                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PDFs */}
                {files.pdfs?.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                            <DocumentIcon className="w-4 h-4 mr-2" />
                            PDFs ({files.pdfs.length})
                        </h4>
                        <div className="space-y-2">
                            {files.pdfs.map((src, idx) => (
                                <motion.div
                                    key={src}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
                                >
                                    <div className="flex items-center">
                                        <DocumentIcon className="w-5 h-5 mr-2 text-red-600" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-xs">
                                            {src.split('/').pop()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeFile('pdfs', idx)}
                                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Documents */}
                {files.documents?.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                            <DocumentTextIcon className="w-4 h-4 mr-2" />
                            Documents ({files.documents.length})
                        </h4>
                        <div className="space-y-2">
                            {files.documents.map((src, idx) => (
                                <motion.div
                                    key={src}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
                                >
                                    <div className="flex items-center">
                                        <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                                        <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-xs">
                                            {src.split('/').pop()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeFile('documents', idx)}
                                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

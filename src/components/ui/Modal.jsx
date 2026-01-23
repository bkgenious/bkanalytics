'use client';

/**
 * Modal Component
 * Lightbox modal for image galleries with keyboard navigation
 */

import { memo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Modal = memo(function Modal({
    isOpen,
    onClose,
    images = [],
    currentIndex = 0,
    onNext,
    onPrevious
}) {
    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'Escape':
                onClose();
                break;
            case 'ArrowRight':
                onNext?.();
                break;
            case 'ArrowLeft':
                onPrevious?.();
                break;
            default:
                break;
        }
    }, [onClose, onNext, onPrevious]);

    // Lock body scroll and add keyboard listeners
    useEffect(() => {
        if (!isOpen) return;

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    // Don't render on server or when closed
    if (!isOpen || typeof window === 'undefined') return null;

    const hasMultipleImages = images.length > 1;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-950/95"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close lightbox"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Image Counter */}
            {hasMultipleImages && (
                <span
                    className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium"
                    aria-live="polite"
                >
                    {currentIndex + 1} / {images.length}
                </span>
            )}

            {/* Navigation Buttons */}
            {hasMultipleImages && (
                <>
                    <button
                        onClick={onPrevious}
                        className="absolute left-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:ring-2 focus-visible:ring-white"
                        aria-label="Previous image"
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={onNext}
                        className="absolute right-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:ring-2 focus-visible:ring-white"
                        aria-label="Next image"
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Main Image */}
            <div className="relative z-10 max-w-[90vw] max-h-[85vh]">
                {images[currentIndex] && (
                    <Image
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1} of ${images.length}`}
                        width={1400}
                        height={900}
                        className="max-h-[85vh] w-auto object-contain rounded-lg animate-scale-in"
                        priority
                    />
                )}
            </div>

            {/* Thumbnail Strip (for many images) */}
            {images.length > 4 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 p-2 rounded-lg bg-white/10">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                // Navigate to specific image
                                const diff = idx - currentIndex;
                                if (diff > 0) {
                                    for (let i = 0; i < diff; i++) onNext?.();
                                } else {
                                    for (let i = 0; i < Math.abs(diff); i++) onPrevious?.();
                                }
                            }}
                            className={`
                                w-12 h-8 rounded overflow-hidden border-2 transition-all
                                ${idx === currentIndex
                                    ? 'border-white scale-110'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                }
                            `}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                width={48}
                                height={32}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>,
        document.body
    );
});

/**
 * Dialog Modal - For confirmation dialogs and forms
 */
export const DialogModal = memo(function DialogModal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
}) {
    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen || typeof window === 'undefined') return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                className={`
                    relative z-10 w-full ${sizeClasses[size]}
                    bg-white dark:bg-neutral-900
                    rounded-xl shadow-modal
                    animate-scale-in
                `}
            >
                {/* Header */}
                {(title || description) && (
                    <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
                        {title && (
                            <h2
                                id="modal-title"
                                className="text-lg font-semibold text-neutral-900 dark:text-white"
                            >
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-5">
                    {children}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Close modal"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
        </div>,
        document.body
    );
});

export default Modal;

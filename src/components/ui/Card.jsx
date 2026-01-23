'use client';

/**
 * Project Card Component
 * Enterprise-grade card with subtle hover effects and professional styling
 */

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Badge from './Badge';

const Card = memo(function Card({ project, index = 0 }) {
    const { id, title, description, tool, thumbnail, images } = project;
    const cover = thumbnail || images?.[0];

    // Stagger animation delay (max 400ms)
    const delay = Math.min(index * 100, 400);

    return (
        <Link
            href={`/projects/${id}`}
            className="block animate-fade-up group focus-visible:outline-none"
            style={{ animationDelay: `${delay}ms` }}
        >
            <article className="card group-focus-visible:ring-2 group-focus-visible:ring-primary-500 group-focus-visible:ring-offset-2">
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-t-lg">
                    {cover ? (
                        <Image
                            src={cover}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            loading="lazy"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex space-x-1 opacity-25">
                                <div className="w-2 h-10 bg-primary-600 dark:bg-primary-400 rounded-sm" />
                                <div className="w-2 h-7 bg-primary-500 dark:bg-primary-400 rounded-sm" />
                                <div className="w-2 h-4 bg-primary-400 dark:bg-primary-500 rounded-sm" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Tool Badge */}
                    <Badge tool={tool} />

                    {/* Title */}
                    <h3 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-1">
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {description}
                    </p>

                    {/* CTA Link */}
                    <div className="mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center">
                        <span>View Case Study</span>
                        <svg
                            className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-200"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                        </svg>
                    </div>
                </div>
            </article>
        </Link>
    );
});

export default Card;

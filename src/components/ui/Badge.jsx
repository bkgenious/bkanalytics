'use client';

/**
 * Badge Component
 * Tool badges with semantic colors for Power BI, Tableau, and Excel
 */

import { memo } from 'react';

const toolStyles = {
    'Power BI': 'badge-powerbi',
    'Tableau': 'badge-tableau',
    'Excel': 'badge-excel',
};

/**
 * Tool Badge - Displays tool name with semantic coloring
 */
const Badge = memo(function Badge({ tool, className = '' }) {
    const styleClass = toolStyles[tool] || 'badge-neutral';

    return (
        <span className={`badge ${styleClass} ${className}`}>
            {tool}
        </span>
    );
});

/**
 * Tag Badge - For project tags with optional remove button
 */
export const TagBadge = memo(function TagBadge({ tag, onRemove, className = '' }) {
    return (
        <span className={`badge badge-neutral ${className}`}>
            <span>{tag}</span>
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemove(tag);
                    }}
                    className="ml-1.5 -mr-0.5 p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                    aria-label={`Remove ${tag} tag`}
                >
                    <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}
        </span>
    );
});

/**
 * Status Badge - For status indicators (success, warning, error, info)
 */
export const StatusBadge = memo(function StatusBadge({ status, children }) {
    const statusStyles = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
        warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
        error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50',
        info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50',
    };

    return (
        <span className={`badge ${statusStyles[status] || statusStyles.info}`}>
            {children}
        </span>
    );
});

export default Badge;

'use client';

/**
 * Toggle Component
 * Accessible toggle switch for boolean settings
 */

import { memo, forwardRef } from 'react';

const Toggle = memo(forwardRef(function Toggle({
    checked = false,
    onChange,
    disabled = false,
    size = 'md',
    label,
    description,
    className = '',
    id,
    ...props
}, ref) {
    const sizes = {
        sm: {
            track: 'w-8 h-4',
            thumb: 'w-3 h-3',
            translateOn: 'translate-x-4',
            translateOff: 'translate-x-0.5',
        },
        md: {
            track: 'w-11 h-6',
            thumb: 'w-4 h-4',
            translateOn: 'translate-x-6',
            translateOff: 'translate-x-1',
        },
        lg: {
            track: 'w-14 h-7',
            thumb: 'w-5 h-5',
            translateOn: 'translate-x-8',
            translateOff: 'translate-x-1',
        },
    };

    const sizeConfig = sizes[size];

    const handleToggle = () => {
        if (!disabled && onChange) {
            onChange(!checked);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
        }
    };

    const toggleElement = (
        <button
            ref={ref}
            type="button"
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled}
            disabled={disabled}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className={`
                relative inline-flex items-center rounded-full
                transition-colors duration-200 ease-in-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                ${sizeConfig.track}
                ${checked
                    ? 'bg-primary-600'
                    : 'bg-neutral-300 dark:bg-neutral-600'
                }
                ${disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }
                ${className}
            `}
            {...props}
        >
            <span
                className={`
                    inline-block rounded-full bg-white shadow-sm
                    transform transition-transform duration-200 ease-in-out
                    ${sizeConfig.thumb}
                    ${checked ? sizeConfig.translateOn : sizeConfig.translateOff}
                `}
            />
        </button>
    );

    // If label is provided, wrap in a label element
    if (label) {
        return (
            <div className="flex items-start">
                {toggleElement}
                <div className="ml-3">
                    <label
                        htmlFor={id}
                        className={`
                            text-sm font-medium text-neutral-900 dark:text-white
                            ${disabled ? 'opacity-50' : 'cursor-pointer'}
                        `}
                        onClick={handleToggle}
                    >
                        {label}
                    </label>
                    {description && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return toggleElement;
}));

/**
 * ToggleGroup - Group of toggle options
 */
export const ToggleGroup = memo(function ToggleGroup({
    label,
    description,
    children,
    className = ''
}) {
    return (
        <div className={`space-y-4 ${className}`}>
            {label && (
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {label}
                    </h3>
                    {description && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
});

export default Toggle;

'use client';

/**
 * Button Component
 * Enterprise-grade button with multiple variants and sizes
 */

import { memo, forwardRef } from 'react';

const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
};

const sizes = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
};

const Button = memo(forwardRef(function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    type = 'button',
    ...props
}, ref) {
    const isDisabled = disabled || loading;

    return (
        <button
            ref={ref}
            type={type}
            disabled={isDisabled}
            className={`
                btn ${variants[variant]} ${sizes[size]}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
            {...props}
        >
            {/* Loading Spinner */}
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            )}

            {/* Left Icon */}
            {!loading && Icon && iconPosition === 'left' && (
                <Icon className="w-4 h-4 mr-2" />
            )}

            {/* Button Text */}
            {children}

            {/* Right Icon */}
            {!loading && Icon && iconPosition === 'right' && (
                <Icon className="w-4 h-4 ml-2" />
            )}
        </button>
    );
}));

/**
 * IconButton - Button with only an icon
 */
export const IconButton = memo(forwardRef(function IconButton({
    icon: Icon,
    variant = 'ghost',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    'aria-label': ariaLabel,
    ...props
}, ref) {
    const isDisabled = disabled || loading;

    const sizeClasses = {
        xs: 'p-1.5',
        sm: 'p-2',
        md: 'p-2.5',
        lg: 'p-3',
    };

    const iconSizes = {
        xs: 'w-3.5 h-3.5',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <button
            ref={ref}
            type="button"
            disabled={isDisabled}
            aria-label={ariaLabel}
            className={`
                btn ${variants[variant]} ${sizeClasses[size]}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <svg
                    className={`animate-spin ${iconSizes[size]}`}
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            ) : (
                <Icon className={iconSizes[size]} />
            )}
        </button>
    );
}));

export default Button;

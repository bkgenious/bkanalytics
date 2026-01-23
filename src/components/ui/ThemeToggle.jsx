'use client';

/**
 * Theme Toggle Component
 * Switches between light and dark mode with system preference support
 */

import { memo, useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle = memo(function ThemeToggle({ className = '' }) {
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);

        // Check for saved preference or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
        document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    // Render placeholder during SSR to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className={`w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 ${className}`} />
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={`
                p-2 rounded-lg
                text-neutral-500 hover:text-neutral-700
                dark:text-neutral-400 dark:hover:text-neutral-200
                hover:bg-neutral-100 dark:hover:bg-neutral-800
                transition-colors duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                ${className}
            `}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <MoonIcon className="w-5 h-5" />
            ) : (
                <SunIcon className="w-5 h-5" />
            )}
        </button>
    );
});

/**
 * Theme Toggle Switch - Alternative toggle style
 */
export const ThemeToggleSwitch = memo(function ThemeToggleSwitch({ className = '' }) {
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
        document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    if (!mounted) {
        return <div className={`w-11 h-6 rounded-full bg-neutral-200 ${className}`} />;
    }

    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className={`
                toggle
                ${isDark ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'}
                ${className}
            `}
            data-state={isDark ? 'checked' : 'unchecked'}
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle dark mode"
        >
            <span className="toggle-thumb">
                {isDark ? (
                    <MoonIcon className="w-3 h-3 text-primary-600" />
                ) : (
                    <SunIcon className="w-3 h-3 text-amber-500" />
                )}
            </span>
        </button>
    );
});

export default ThemeToggle;

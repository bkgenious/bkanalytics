'use client';

/**
 * Header Component
 * Fixed navigation with professional styling
 */

import { memo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '../ui/ThemeToggle';

const navItems = [
    { name: 'Work', href: '/#projects' },
    { name: 'Expertise', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
];

const Header = memo(function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Add shadow on scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`
                fixed top-0 left-0 right-0 z-40
                bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm
                border-b border-neutral-200 dark:border-neutral-800
                transition-shadow duration-200
                ${scrolled ? 'shadow-sm' : ''}
            `}
        >
            <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center space-x-3 group"
                    aria-label="DataInsight - Home"
                >
                    {/* Logo Mark */}
                    <div className="flex space-x-0.5">
                        <div className="w-1.5 h-6 bg-primary-600 dark:bg-primary-400 rounded-sm transition-transform group-hover:scale-110" />
                        <div className="w-1.5 h-4 bg-primary-500 dark:bg-primary-400 rounded-sm transition-transform group-hover:scale-110 delay-75" />
                        <div className="w-1.5 h-2.5 bg-primary-400 dark:bg-primary-500 rounded-sm transition-transform group-hover:scale-110 delay-100" />
                    </div>

                    {/* Logo Text */}
                    <span className="text-lg font-semibold text-neutral-900 dark:text-white">
                        DataInsight
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-2">
                    <ThemeToggle />

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? (
                            <XMarkIcon className="w-6 h-6" />
                        ) : (
                            <Bars3Icon className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 animate-fade-in">
                    <div className="px-6 py-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-3 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
});

export default Header;

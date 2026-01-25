'use client';

/**
 * Admin Layout Component
 * Sidebar navigation with professional internal-tool styling
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ui/ThemeToggle';
import {
    HomeIcon,
    FolderIcon,
    PlusCircleIcon,
    ArrowLeftOnRectangleIcon,
    ArrowTopRightOnSquareIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { isCMS, getEnvironmentName } from '@/lib/env';
import { ToastProvider } from '@/components/ui/Toast';

export default function AdminLayout({ children, onLogout }) {
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Projects', href: '/admin', icon: FolderIcon },
        { name: 'New Project', href: '/admin/projects/new', icon: PlusCircleIcon },
        { name: 'Publish', href: '/admin/publish', icon: CloudArrowUpIcon },
    ];

    const router = useRouter(); // Ensure useRouter is imported

    const handleLogout = async () => {
        try {
            await fetch('/api/auth', { method: 'DELETE' });
            onLogout?.();
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <ToastProvider>
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
                {/* Sidebar */}
                <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-30 flex flex-col">
                    {/* Logo */}
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                        <Link href="/admin" className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">D</span>
                            </div>
                            <div className="ml-3">
                                <span className="text-base font-bold text-slate-900 dark:text-white">
                                    Admin
                                </span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">
                                    Portfolio Manager
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Environment Badge */}
                    <div className="px-5 pt-4">
                        {isCMS() ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                {getEnvironmentName()}
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-1.5"></span>
                                {getEnvironmentName()}
                            </span>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/admin' && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }
                                    `}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-1">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Theme</span>
                            <ThemeToggle />
                        </div>

                        {/* View Site */}
                        <Link
                            href="/"
                            target="_blank"
                            className="flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-3" />
                            View Site
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <main className="ml-64 min-h-screen">
                    <div className="p-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </ToastProvider>
    );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, HomeIcon, FolderIcon, UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const commands = [
    { id: 'home', name: 'Go to Home', href: '/', icon: HomeIcon },
    { id: 'projects', name: 'View Projects', href: '/#projects', icon: FolderIcon },
    { id: 'about', name: 'About', href: '/about', icon: UserIcon },
    { id: 'admin', name: 'Admin Dashboard', href: '/admin', icon: Cog6ToothIcon },
];

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef(null);
    const router = useRouter();

    // Filter commands
    const filteredCommands = commands.filter((cmd) =>
        cmd.name.toLowerCase().includes(search.toLowerCase())
    );

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const selectCommand = useCallback((cmd) => {
        router.push(cmd.href);
        setIsOpen(false);
        setSearch('');
    }, [router]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Palette */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden animate-fade-up">
                {/* Search Input */}
                <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-4">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search commands..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent py-4 px-3 text-slate-900 dark:text-white outline-none placeholder-slate-400"
                    />
                    <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 rounded">
                        ESC
                    </kbd>
                </div>

                {/* Commands List */}
                <ul className="max-h-80 overflow-y-auto p-2">
                    {filteredCommands.length === 0 ? (
                        <li className="text-center text-slate-500 py-8">No results found</li>
                    ) : (
                        filteredCommands.map((cmd) => (
                            <li key={cmd.id}>
                                <button
                                    onClick={() => selectCommand(cmd)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <cmd.icon className="w-5 h-5 text-primary-500" />
                                    <span>{cmd.name}</span>
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}

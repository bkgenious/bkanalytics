'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/admin';

    // Animation mount check
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error?.message || 'Login failed');
            }

            // Success - Redirect
            router.replace(from);

        } catch (err) {
            console.error(err);
            setError(err.message === 'Invalid credentials'
                ? 'Invalid username or password'
                : 'Connection failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    if (!mounted) return null;

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary-900/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-secondary-900/20 rounded-full blur-2xl" />

            <div className="relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-500/10 text-primary-500 mb-6 group">
                        <LockClosedIcon className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                        Portfolio Admin
                    </h1>
                    <p className="text-neutral-400 text-sm">
                        Enter your credentials to access the dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-4 rounded-lg bg-red-900/30 border border-red-800 text-red-200 text-sm animate-shake">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1.5 ml-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:ring-2 focus:ring-primary-600/50 focus:border-primary-600 text-white placeholder-neutral-500 transition-all outline-none"
                            placeholder="admin"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1.5 ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:ring-2 focus:ring-primary-600/50 focus:border-primary-600 text-white placeholder-neutral-500 transition-all outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-900/20 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-neutral-500">
                        Protected by industry-standard encryption
                    </p>
                </div>
            </div>
        </div>
    );
}

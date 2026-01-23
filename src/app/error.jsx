'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        console.error('Global application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
            <Header />
            <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                    Something went wrong
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-md mb-8">
                    An unexpected error occurred. Please try again or contact support if the problem persists.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => reset()}
                        className="btn btn-primary"
                    >
                        Try Again
                    </button>
                    <Link href="/" className="btn btn-outline">
                        Go Home
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}

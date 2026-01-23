'use client';

import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
            <Header />
            <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-6">
                    <MagnifyingGlassIcon className="w-8 h-8 text-neutral-500" />
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                    Page not found
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-md mb-8">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
                </p>
                <div className="flex gap-4">
                    <Link href="/" className="btn btn-primary">
                        Return Home
                    </Link>
                    <Link href="/#contact" className="btn btn-outline">
                        Contact Support
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}

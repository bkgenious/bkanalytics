'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Loading() {
    return (
        <main className="min-h-screen bg-white dark:bg-neutral-950">
            <Header />
            <div className="pt-32 pb-20 max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="skeleton aspect-[16/10] rounded-t-lg" />
                            <div className="p-5 bg-white dark:bg-neutral-900 border border-t-0 border-neutral-200 dark:border-neutral-800 rounded-b-lg">
                                <div className="skeleton h-5 w-20 mb-3 rounded" />
                                <div className="skeleton h-6 w-3/4 mb-3 rounded" />
                                <div className="skeleton h-4 w-full rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}

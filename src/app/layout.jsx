import './globals.css';

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: 'DataViz Portfolio | Data Analytics & Visualization Expert',
    description: 'Professional portfolio showcasing Power BI, Tableau, and Excel dashboards. Transform your data into actionable insights.',
    keywords: ['Power BI', 'Tableau', 'Excel', 'Data Visualization', 'Dashboard', 'Analytics'],
    authors: [{ name: 'Data Analytics Professional' }],
    openGraph: {
        title: 'DataViz Portfolio | Data Analytics Expert',
        description: 'Professional portfolio showcasing Power BI, Tableau, and Excel dashboards.',
        type: 'website',
        images: [
            {
                url: '/api/og', // Dynamic OG image
                width: 1200,
                height: 630,
            },
        ],
    },
};

import { WebVitals } from '@/components/analytics/WebVitals';
import CommandPalette from '@/components/CommandPalette';

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var theme = localStorage.getItem('theme');
                                    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                                        document.documentElement.classList.add('dark');
                                    } else {
                                        document.documentElement.classList.remove('dark');
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#3b82f6" />
            </head>
            <body className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
                <WebVitals />
                <CommandPalette />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Person',
                            name: 'Data Analytics Professional',
                            url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                            jobTitle: 'Data Analyst',
                        }),
                    }}
                />
                {children}
            </body>
        </html>
    );
}

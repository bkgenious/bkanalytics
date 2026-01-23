import './globals.css';

export const metadata = {
    title: 'DataViz Portfolio | Data Analytics & Visualization Expert',
    description: 'Professional portfolio showcasing Power BI, Tableau, and Excel dashboards. Transform your data into actionable insights.',
    keywords: ['Power BI', 'Tableau', 'Excel', 'Data Visualization', 'Dashboard', 'Analytics'],
    authors: [{ name: 'Data Analytics Professional' }],
    openGraph: {
        title: 'DataViz Portfolio | Data Analytics Expert',
        description: 'Professional portfolio showcasing Power BI, Tableau, and Excel dashboards.',
        type: 'website',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
                {children}
            </body>
        </html>
    );
}

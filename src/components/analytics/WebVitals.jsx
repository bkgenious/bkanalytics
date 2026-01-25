'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
    useReportWebVitals((metric) => {
        // In production, you would send this to an analytics endpoint
        // For now, we log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('[WebVitals]', metric);
        }
    });

    return null;
}

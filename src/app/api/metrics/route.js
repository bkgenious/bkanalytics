/**
 * Metrics API
 * GET: Returns calculated public metrics
 * POST: Updates site configuration (Protected)
 */

import { NextResponse } from 'next/server';
import { getMetrics, invalidateMetricsCache } from '@/lib/metrics';
import { updateConfig } from '@/lib/config';
import { isAuthenticated } from '@/lib/auth';

// Force dynamic - we want real-time even if we cache internally
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const metrics = getMetrics();
        return NextResponse.json(metrics);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch metrics' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    // 1. Auth Check
    if (!isAuthenticated(request)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const updates = await request.json();

        // 2. Update Config
        const newConfig = updateConfig(updates);

        // 3. Invalidate Metrics Cache immediately
        invalidateMetricsCache();

        return NextResponse.json({
            success: true,
            config: newConfig
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message || 'Failed to update configuration' },
            { status: 400 }
        );
    }
}

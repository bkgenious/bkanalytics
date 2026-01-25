/**
 * Metrics API
 * GET: Returns calculated public metrics
 * POST: Updates site configuration (Protected)
 */

import { getMetrics, invalidateMetricsCache } from '@/lib/metrics';
import { updateConfig } from '@/lib/config';
import { isAuthenticated } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/api-response';
import { validateRequest } from '@/lib/validation';
import { ConfigSchema } from '@/lib/schemas/config';

// Force dynamic - we want real-time even if we cache internally
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const metrics = getMetrics();
        return apiResponse(metrics);
    } catch (error) {
        console.error('Metrics fetch error:', error);
        return apiError('Failed to fetch metrics', 'INTERNAL_ERROR', 500);
    }
}

export async function POST(request) {
    // 1. Auth Check
    if (!isAuthenticated(request)) {
        return apiError('Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        // 2. Validate Body
        const validation = await validateRequest(request, ConfigSchema, 'body');
        if (!validation.success) {
            return validation.response;
        }

        // 3. Update Config
        const newConfig = updateConfig(validation.data);

        // 4. Invalidate Metrics Cache immediately
        invalidateMetricsCache();

        return apiResponse({
            config: newConfig
        });
    } catch (error) {
        console.error('Config update error:', error);
        return apiError('Failed to update configuration', 'INTERNAL_ERROR', 500);
    }
}

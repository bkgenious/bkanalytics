import { apiResponse, apiError } from '@/lib/api-response';
import { isAuthenticated } from '@/lib/auth';
import { getActivityLogs } from '@/lib/activityLog';

export async function GET(request) {
    // Require authentication
    if (!isAuthenticated(request)) {
        return apiError('Unauthorized', 'UNAUTHORIZED', 401);
    }

    try {
        const logs = getActivityLogs();
        return apiResponse(logs);
    } catch (error) {
        console.error('[API] Activity GET error:', error);
        return apiError('Failed to fetch activity logs', 'INTERNAL_ERROR', 500);
    }
}

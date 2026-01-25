import { duplicateProject } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/api-response';
import { isAuthenticated, validateRequestOrigin } from '@/lib/auth';

export async function POST(request, { params }) {
    try {
        // 1. Security
        if (!validateRequestOrigin(request)) {
            return apiError('Invalid origin', 'FORBIDDEN', 403);
        }

        if (!isAuthenticated(request)) {
            return apiError('Unauthorized', 'UNAUTHORIZED', 401);
        }


        const { id } = await params;

        // 2. Duplicate
        const newProject = duplicateProject(id);

        if (!newProject) {
            return apiError('Project not found', 'NOT_FOUND', 404);
        }

        return apiResponse(newProject, { status: 201 });

    } catch (error) {
        console.error('Duplication error:', error);
        // db.js throws if production read-only
        if (error.message.includes('read-only')) {
            return apiError(error.message, 'READ_ONLY', 403);
        }
        return apiError('Failed to duplicate project', 'INTERNAL_ERROR', 500);
    }
}

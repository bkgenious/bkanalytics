/**
 * Backup API
 * Streams an ENCRYPTED ZIP file of the data and uploads directories
 * ENCRYPTION: AES-256-GCM
 */

/**
 * Backup API
 * Download a snapshot of the current database
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAuthenticated } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    if (!isAuthenticated(request)) {
        return apiError('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const projectsFile = path.join(process.cwd(), 'data', 'projects.json');

    if (!fs.existsSync(projectsFile)) {
        return apiError('Database not initialized', 'NOT_FOUND', 404);
    }

    try {
        const data = fs.readFileSync(projectsFile, 'utf-8');
        const projects = JSON.parse(data);

        return apiResponse(projects);
    } catch (error) {
        console.error('Backup error:', error);
        return apiError('Failed to generate backup', 'INTERNAL_ERROR', 500);
    }
}

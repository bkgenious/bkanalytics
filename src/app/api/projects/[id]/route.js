/**
 * Single Project API Route - Production Hardened
 * GET - Fetch single project (public)
 * PUT - Update project (admin protected)
 * DELETE - Delete project (admin protected)
 */

import { NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject } from '@/lib/db';
import { isAuthenticated, validateRequestOrigin } from '@/lib/auth';
import { isValidUUID, validateRequest } from '@/lib/validation';
import { UpdateProjectSchema } from '@/lib/schemas/project';
import { apiResponse, apiError } from '@/lib/api-response';

// GET /api/projects/[id] - Public endpoint
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Validate ID format
        if (!isValidUUID(id)) {
            return apiError('Invalid project ID format', 'VALIDATION_ERROR', 400);
        }

        const project = getProjectById(id);

        if (!project) {
            return apiError('Project not found', 'NOT_FOUND', 404);
        }

        return apiResponse(project, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        return apiError('Failed to fetch project', 'INTERNAL_ERROR', 500);
    }
}

// PUT is already handled...

// DELETE /api/projects/[id] - Admin protected
export async function DELETE(request, { params }) {
    try {
        // Validate request origin
        if (!validateRequestOrigin(request)) {
            return apiError('Invalid request origin', 'FORBIDDEN', 403);
        }

        // Check authentication
        if (!isAuthenticated(request)) {
            return apiError('Unauthorized', 'UNAUTHORIZED', 401);
        }

        const { id } = await params;

        // Validate ID format
        if (!isValidUUID(id)) {
            return apiError('Invalid project ID format', 'VALIDATION_ERROR', 400);
        }

        const deleted = deleteProject(id);

        if (!deleted) {
            return apiError('Project not found', 'NOT_FOUND', 404);
        }

        return apiResponse({ message: 'Project deleted' });
    } catch (error) {
        console.error('Error deleting project:', error);
        return apiError('Failed to delete project', 'INTERNAL_ERROR', 500);
    }
}

// PUT /api/projects/[id] - Admin protected
export async function PUT(request, { params }) {
    try {
        // Validate request origin
        if (!validateRequestOrigin(request)) {
            return apiError('Invalid request origin', 'FORBIDDEN', 403);
        }

        // Check authentication
        if (!isAuthenticated(request)) {
            return apiError('Unauthorized', 'UNAUTHORIZED', 401);
        }

        const { id } = await params;

        // Validate ID format
        if (!isValidUUID(id)) {
            return apiError('Invalid project ID format', 'VALIDATION_ERROR', 400);
        }

        // Validate Body
        const validation = await validateRequest(request, UpdateProjectSchema, 'body');
        if (!validation.success) {
            return validation.response;
        }

        // Update project
        const updatedProject = updateProject(id, validation.data);

        if (!updatedProject) {
            return apiError('Project not found', 'NOT_FOUND', 404);
        }

        return apiResponse(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        return apiError('Failed to update project', 'INTERNAL_ERROR', 500);
    }
}


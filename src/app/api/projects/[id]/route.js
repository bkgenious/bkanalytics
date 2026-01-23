/**
 * Single Project API Route - Production Hardened
 * GET - Fetch single project (public)
 * PUT - Update project (admin protected)
 * DELETE - Delete project (admin protected)
 */

import { NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject } from '@/lib/db';
import { isAuthenticated, validateRequestOrigin } from '@/lib/auth';
import { validateProjectData, isValidUUID, createErrorResponse } from '@/lib/validation';

// GET /api/projects/[id] - Public endpoint
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Validate ID format
        if (!isValidUUID(id)) {
            return NextResponse.json(
                createErrorResponse('Invalid project ID format', 400),
                { status: 400 }
            );
        }

        const project = getProjectById(id);

        if (!project) {
            return NextResponse.json(
                createErrorResponse('Project not found', 404),
                { status: 404 }
            );
        }

        return NextResponse.json(project, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        console.error('Error fetching project:', error.message);
        return NextResponse.json(
            createErrorResponse('Failed to fetch project', 500),
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id] - Admin protected
export async function PUT(request, { params }) {
    try {
        // Validate request origin
        if (!validateRequestOrigin(request)) {
            return NextResponse.json(
                createErrorResponse('Invalid request origin', 403),
                { status: 403 }
            );
        }

        // Check authentication
        if (!isAuthenticated(request)) {
            return NextResponse.json(
                createErrorResponse('Unauthorized', 401),
                { status: 401 }
            );
        }

        const { id } = await params;

        // Validate ID format
        if (!isValidUUID(id)) {
            return NextResponse.json(
                createErrorResponse('Invalid project ID format', 400),
                { status: 400 }
            );
        }

        // Parse and validate body
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                createErrorResponse('Invalid JSON body', 400),
                { status: 400 }
            );
        }

        // Validate project data
        const validation = validateProjectData(body);
        if (!validation.valid) {
            return NextResponse.json(
                createErrorResponse(validation.errors.join(', '), 400),
                { status: 400 }
            );
        }

        // Update project with sanitized data
        const updatedProject = updateProject(id, validation.sanitized);

        if (!updatedProject) {
            return NextResponse.json(
                createErrorResponse('Project not found', 404),
                { status: 404 }
            );
        }

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error.message);
        return NextResponse.json(
            createErrorResponse('Failed to update project', 500),
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id] - Admin protected
export async function DELETE(request, { params }) {
    try {
        // Validate request origin
        if (!validateRequestOrigin(request)) {
            return NextResponse.json(
                createErrorResponse('Invalid request origin', 403),
                { status: 403 }
            );
        }

        // Check authentication
        if (!isAuthenticated(request)) {
            return NextResponse.json(
                createErrorResponse('Unauthorized', 401),
                { status: 401 }
            );
        }

        const { id } = await params;

        // Validate ID format
        if (!isValidUUID(id)) {
            return NextResponse.json(
                createErrorResponse('Invalid project ID format', 400),
                { status: 400 }
            );
        }

        const deleted = deleteProject(id);

        if (!deleted) {
            return NextResponse.json(
                createErrorResponse('Project not found', 404),
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Project deleted' });
    } catch (error) {
        console.error('Error deleting project:', error.message);
        return NextResponse.json(
            createErrorResponse('Failed to delete project', 500),
            { status: 500 }
        );
    }
}

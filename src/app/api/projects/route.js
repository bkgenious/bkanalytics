/**
 * Projects API Route - Production Hardened
 * GET - Fetch all projects (public)
 * POST - Create new project (admin protected)
 */

import { NextResponse } from 'next/server';
import { getAllProjects, createProject } from '@/lib/db';
import { isAuthenticated, validateRequestOrigin } from '@/lib/auth';
import { validateProjectData, createErrorResponse } from '@/lib/validation';

// GET /api/projects - Public endpoint (Filtered)
export async function GET(request) {
    try {
        const projects = getAllProjects();

        // Check if user is admin
        const isAdmin = isAuthenticated(request);

        // If not admin, filter out drafts
        const visibleProjects = isAdmin
            ? projects
            : projects.filter(p => p.status === 'published');

        return NextResponse.json(visibleProjects, {
            headers: {
                // Cache publicly for 60s, but revalidate.
                // Note: If using a CDN/Vercel, we might want different cache keys for admin vs public,
                // but since this is Cookie-based auth, standard HTTP caching might be tricky.
                // We'll trust the browser/Next.js to handle Vary: Cookie if applicable,
                // or just set a short cache.
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300, Vary=Cookie',
            },
        });
    } catch (error) {
        console.error('Error fetching projects:', error.message);
        return NextResponse.json(
            createErrorResponse('Failed to fetch projects', 500),
            { status: 500 }
        );
    }
}

// POST /api/projects - Admin protected
export async function POST(request) {
    try {
        // Validate request origin (CSRF protection)
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

        // Create project with sanitized data
        const project = createProject(validation.sanitized);

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error.message);
        return NextResponse.json(
            createErrorResponse('Failed to create project', 500),
            { status: 500 }
        );
    }
}

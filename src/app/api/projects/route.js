/**
 * Projects API Route - Enterprise Grade
 * GET - Fetch all projects (public)
 * POST - Create new project (admin protected)
 */

import { NextResponse } from 'next/server';
import { getAllProjects, createProject } from '@/lib/db';
import { isAuthenticated, validateRequestOrigin } from '@/lib/auth';
import { validateRequest } from '@/lib/validation';
import { CreateProjectSchema, ProjectQuerySchema } from '@/lib/schemas/project';
import { apiResponse, apiError } from '@/lib/api-response';
import { generateETag } from '@/lib/etag';

// GET /api/projects - Public endpoint (Filtered & Cached)
export async function GET(request) {
    try {
        // 1. Parsing & Validation of Query Params
        const { searchParams } = new URL(request.url);
        // Note: ProjectQuerySchema expects an object, not URLSearchParams directly.
        // We use validateRequest with 'query' source which handles conversion? 
        // No, my validateRequest implementation did handle 'query' by converting searchParams to object.
        const queryValidation = await validateRequest(request, ProjectQuerySchema, 'query');

        // If query is invalid, return validation error (Strict Mode)
        if (!queryValidation.success) {
            return queryValidation.response;
        }

        const filters = queryValidation.data;
        const projects = getAllProjects();

        // 2. Check Authentication (for 'draft' visibility)
        const isAdmin = isAuthenticated(request);

        // 3. Apply Filters
        let filtered = projects.filter(p => {
            // Admin sees all, Public sees only published
            if (!isAdmin && p.status !== 'published') return false;

            // Explicit status filter (Admin can query 'draft', Public restricted above)
            // But if user passes ?status=draft and is NOT admin, they get nothing due to line above.
            if (filters.status && p.status !== filters.status) return false;

            // Tool filter (projects have 'tool' field, not 'techStack')
            if (filters.tech) {
                const techLower = filters.tech.toLowerCase();
                const matchesTool = p.tool?.toLowerCase() === techLower;
                const matchesTags = Array.isArray(p.tags) && p.tags.some(t => t?.toLowerCase() === techLower);
                if (!matchesTool && !matchesTags) return false;
            }

            // Search filter (Title, Description, Tags) - with defensive null checks
            if (filters.search) {
                const q = filters.search.toLowerCase();
                const matchTitle = p.title?.toLowerCase().includes(q) || false;
                const matchDesc = p.description?.toLowerCase().includes(q) || false;
                const matchTags = Array.isArray(p.tags) && p.tags.some(tag => tag?.toLowerCase().includes(q));

                if (!matchTitle && !matchDesc && !matchTags) return false;
            }

            return true;
        });

        // 4. Apply Sorting
        filtered.sort((a, b) => {
            if (filters.sort === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
            if (filters.sort === 'title-asc') return a.title.localeCompare(b.title);
            // Default: date-desc
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // 5. Pagination
        const page = filters.page;
        const limit = filters.limit;
        const startIndex = (page - 1) * limit;
        const paginated = filtered.slice(startIndex, startIndex + limit);

        // 6. ETag & Caching
        const etag = generateETag(paginated);
        const ifNoneMatch = request.headers.get('if-none-match');

        if (ifNoneMatch === etag) {
            return new NextResponse(null, { status: 304 });
        }

        return apiResponse(paginated, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300, Vary=Cookie',
                'ETag': etag
            },
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return apiError('Failed to fetch projects', 'INTERNAL_ERROR', 500);
    }
}

// POST /api/projects - Admin protected
export async function POST(request) {
    try {
        // Validate request origin (CSRF protection)
        if (!validateRequestOrigin(request)) {
            return apiError('Invalid request origin', 'FORBIDDEN', 403);
        }

        // Check authentication
        if (!isAuthenticated(request)) {
            return apiError('Unauthorized', 'UNAUTHORIZED', 401);
        }

        // Validate Body against Zod Schema
        const validation = await validateRequest(request, CreateProjectSchema, 'body');
        if (!validation.success) {
            return validation.response;
        }

        // Create project with sanitized data
        const project = createProject(validation.data);

        return apiResponse(project, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return apiError('Failed to create project', 'INTERNAL_ERROR', 500);
    }
}

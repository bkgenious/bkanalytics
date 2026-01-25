/**
 * Project Reorder API
 * Handles drag-and-drop sort order updates
 */

import { NextResponse } from 'next/server';
import { updateProjectOrder } from '@/lib/db';
import { isAuthenticated, validateRequestOrigin } from '@/lib/auth';
import { createErrorResponse } from '@/lib/validation';

export async function PUT(request) {
    try {
        // Security checks
        if (!validateRequestOrigin(request)) {
            return NextResponse.json(createErrorResponse('Invalid origin', 403), { status: 403 });
        }

        if (!isAuthenticated(request)) {
            return NextResponse.json(createErrorResponse('Unauthorized', 401), { status: 401 });
        }

        const body = await request.json();

        // Validate body is array of { id, order }
        if (!Array.isArray(body)) {
            return NextResponse.json(createErrorResponse('Invalid body: expected array', 400), { status: 400 });
        }

        const reordered = body.map(item => ({
            id: item.id,
            order: parseInt(item.order)
        })).filter(item => item.id && !isNaN(item.order));

        if (reordered.length === 0) {
            return NextResponse.json(createErrorResponse('No valid items to reorder', 400), { status: 400 });
        }

        updateProjectOrder(reordered);

        return NextResponse.json({ success: true, count: reordered.length });
    } catch (error) {
        console.error('Reorder error:', error);
        return NextResponse.json(createErrorResponse(error.message, 500), { status: 500 });
    }
}

import { apiError } from './api-response';
import { NextResponse } from 'next/server';

/**
 * Validates request data against a Zod schema.
 * @param {Request} request 
 * @param {import('zod').ZodSchema} schema 
 * @param {'body'|'query'} source 
 */
export async function validateRequest(request, schema, source = 'body') {
    let data;

    try {
        if (source === 'body') {
            data = await request.json();
        } else {
            const { searchParams } = new URL(request.url);
            // Handle array params if needed? For now simple object.
            data = Object.fromEntries(searchParams.entries());
        }

        const result = await schema.safeParseAsync(data);

        if (!result.success) {
            const details = result.error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }));

            return {
                success: false,
                response: apiError('Validation Failed', 'VALIDATION_ERROR', 400, details)
            };
        }

        return { success: true, data: result.data };

    } catch (e) {
        return {
            success: false,
            response: apiError('Invalid Request Format', 'BAD_REQUEST', 400)
        };
    }
}

// --- Legacy Helpers (Restored for compatibility) ---

export function createErrorResponse(message, status = 400) {
    return NextResponse.json({ error: message }, { status });
}

export function isValidUUID(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

export function validateProjectData(data) {
    const errors = [];
    if (!data.title) errors.push('Title is required');
    if (!data.description) errors.push('Description is required');
    // Add more as needed by legacy routes
    return errors;
}

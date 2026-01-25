/**
 * Authentication API Route - Enterprise Grade
 * POST - Login with credentials
 * DELETE - Logout (clear session)
 * GET - Check auth status
 */

import { NextResponse } from 'next/server';
import {
    validateCredentials,
    generateSessionToken,
    createAuthHeaders,
    createLogoutHeaders,
    isAuthenticated,
    validateRequestOrigin
} from '@/lib/auth';
import { validateRequest } from '@/lib/validation';
import { LoginSchema } from '@/lib/schemas/auth';
import { apiResponse, apiError } from '@/lib/api-response';

// POST /api/auth - Login
export async function POST(request) {
    try {
        // Validate request origin
        if (!validateRequestOrigin(request)) {
            return apiError('Invalid request origin', 'FORBIDDEN', 403);
        }

        // Validate Body
        const validation = await validateRequest(request, LoginSchema, 'body');
        if (!validation.success) {
            return validation.response;
        }

        const { username, password } = validation.data;

        // Validate credentials (uses scrypt + timing-safe comparison)
        const valid = await validateCredentials(username, password);
        if (!valid) {
            // Generic error message to prevent username enumeration
            return apiError('Invalid credentials', 'UNAUTHORIZED', 401);
        }

        // Generate session token
        let token;
        try {
            token = generateSessionToken(username);
        } catch (error) {
            console.error('Token generation failed:', error);
            return apiError('Authentication service unavailable', 'SERVICE_UNAVAILABLE', 503);
        }

        // Create response with secure cookie
        const response = apiResponse({ message: 'Login successful' });

        // Set auth cookie
        const headers = createAuthHeaders(token);
        response.headers.set('Set-Cookie', headers['Set-Cookie']);

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return apiError('Login failed', 'INTERNAL_ERROR', 500);
    }
}

// DELETE /api/auth - Logout
export async function DELETE(request) {
    try {
        // Validate request origin
        if (!validateRequestOrigin(request)) {
            return apiError('Invalid request origin', 'FORBIDDEN', 403);
        }

        const response = apiResponse({ message: 'Logout successful' });

        // Clear auth cookie
        const headers = createLogoutHeaders();
        response.headers.set('Set-Cookie', headers['Set-Cookie']);

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return apiError('Logout failed', 'INTERNAL_ERROR', 500);
    }
}

// GET /api/auth - Check auth status
export async function GET(request) {
    try {
        const authenticated = isAuthenticated(request);

        return apiResponse({ authenticated }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Auth check error:', error);
        // Fail open? No, fail closed usually. But for status check, returning false is safer.
        return apiResponse({ authenticated: false });
    }
}

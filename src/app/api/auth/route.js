/**
 * Authentication API Route - Production Hardened
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
import { sanitizeString, createErrorResponse } from '@/lib/validation';

// POST /api/auth - Login
export async function POST(request) {
    try {
        // Validate request origin
        if (!validateRequestOrigin(request)) {
            return NextResponse.json(
                createErrorResponse('Invalid request origin', 403),
                { status: 403 }
            );
        }

        // Parse body
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                createErrorResponse('Invalid request body', 400),
                { status: 400 }
            );
        }

        const { username, password } = body;

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                createErrorResponse('Username and password are required', 400),
                { status: 400 }
            );
        }

        // Sanitize inputs
        const sanitizedUsername = sanitizeString(username, 100);
        const sanitizedPassword = password.substring(0, 200); // Don't trim passwords

        // Validate credentials (uses timing-safe comparison)
        if (!validateCredentials(sanitizedUsername, sanitizedPassword)) {
            // Generic error message to prevent username enumeration
            return NextResponse.json(
                createErrorResponse('Invalid credentials', 401),
                { status: 401 }
            );
        }

        // Generate session token
        let token;
        try {
            token = generateSessionToken(sanitizedUsername);
        } catch (error) {
            console.error('Token generation failed:', error.message);
            return NextResponse.json(
                createErrorResponse('Authentication service unavailable', 503),
                { status: 503 }
            );
        }

        // Create response with secure cookie
        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
        });

        // Set auth cookie
        const headers = createAuthHeaders(token);
        response.headers.set('Set-Cookie', headers['Set-Cookie']);

        return response;
    } catch (error) {
        console.error('Login error:', error.message);
        return NextResponse.json(
            createErrorResponse('Login failed', 500),
            { status: 500 }
        );
    }
}

// DELETE /api/auth - Logout
export async function DELETE(request) {
    try {
        // Validate request origin
        if (!validateRequestOrigin(request)) {
            return NextResponse.json(
                createErrorResponse('Invalid request origin', 403),
                { status: 403 }
            );
        }

        const response = NextResponse.json({
            success: true,
            message: 'Logout successful',
        });

        // Clear auth cookie
        const headers = createLogoutHeaders();
        response.headers.set('Set-Cookie', headers['Set-Cookie']);

        return response;
    } catch (error) {
        console.error('Logout error:', error.message);
        return NextResponse.json(
            createErrorResponse('Logout failed', 500),
            { status: 500 }
        );
    }
}

// GET /api/auth - Check auth status
export async function GET(request) {
    try {
        const authenticated = isAuthenticated(request);

        return NextResponse.json({
            authenticated,
        }, {
            headers: {
                // Don't cache auth status
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Auth check error:', error.message);
        return NextResponse.json({
            authenticated: false,
        });
    }
}

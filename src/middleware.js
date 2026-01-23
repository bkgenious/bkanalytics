/**
 * Next.js Middleware for Security
 * Adds security headers, rate limiting, and request validation
 * 
 * IMPLEMENTATION NOTES:
 * - This middleware runs on the Edge Runtime (no Node.js APIs like fs, path)
 * - Rate limiting uses in-memory Map storage
 * - Rate limits RESET when the server restarts (acceptable for single-user)
 * - For production clusters, replace with Redis or edge-based rate limiting
 */

import { NextResponse } from 'next/server';

/**
 * Rate limiting store (in-memory for single instance)
 * IMPORTANT: This store resets when the Next.js server restarts.
 * This is acceptable for personal portfolio use but not for production SaaS.
 */
const rateLimitStore = new Map();

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = {
    api: 60,      // 60 requests per minute for API
    auth: 10,     // 10 login attempts per minute
    upload: 20,   // 20 uploads per minute
};

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimits() {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now - value.windowStart > RATE_LIMIT_WINDOW) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Check rate limit for a given key and type
 */
function checkRateLimit(key, type = 'api') {
    const now = Date.now();
    const maxRequests = RATE_LIMIT_MAX_REQUESTS[type] || RATE_LIMIT_MAX_REQUESTS.api;

    const record = rateLimitStore.get(key);

    if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
        rateLimitStore.set(key, { count: 1, windowStart: now });
        return { allowed: true, remaining: maxRequests - 1 };
    }

    if (record.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - record.windowStart)) / 1000)
        };
    }

    record.count++;
    return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Get client IP address from request
 */
function getClientIP(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    return 'unknown';
}

/**
 * Security headers for all responses
 */
function addSecurityHeaders(response) {
    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    response.headers.set('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "media-src 'self' blob:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
    ].join('; '));

    // Permissions Policy
    response.headers.set('Permissions-Policy', [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
    ].join(', '));

    // HSTS (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
        );
    }

    return response;
}

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const clientIP = getClientIP(request);

    // Periodic cleanup
    if (Math.random() < 0.01) {
        cleanupRateLimits();
    }

    // API Routes - Apply rate limiting
    if (pathname.startsWith('/api/')) {
        let rateLimitType = 'api';

        // Stricter limits for auth endpoints
        if (pathname === '/api/auth' && request.method === 'POST') {
            rateLimitType = 'auth';
        }

        // Stricter limits for upload endpoints
        if (pathname === '/api/upload') {
            rateLimitType = 'upload';
        }

        const rateLimitKey = `${clientIP}:${rateLimitType}`;
        const rateLimit = checkRateLimit(rateLimitKey, rateLimitType);

        if (!rateLimit.allowed) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Too many requests',
                    retryAfter: rateLimit.retryAfter
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': String(rateLimit.retryAfter),
                        'X-RateLimit-Remaining': '0',
                    }
                }
            );
        }

        // Continue with request, add rate limit headers to response
        const response = NextResponse.next();
        response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
        return addSecurityHeaders(response);
    }

    // Admin routes - Add security headers
    if (pathname.startsWith('/admin')) {
        const response = NextResponse.next();
        // Additional header to prevent caching of admin pages
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        return addSecurityHeaders(response);
    }

    // All other routes - Add security headers
    const response = NextResponse.next();
    return addSecurityHeaders(response);
}

export const config = {
    matcher: [
        // Match all paths except static files
        '/((?!_next/static|_next/image|favicon.ico|uploads/).*)',
    ],
};

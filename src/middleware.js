/**
 * Next.js Middleware for Security
 * Defense-in-Depth: Headers, Rate Limiting, Environment Fencing
 */

import { NextResponse } from 'next/server';

// In-memory rate limiting (Resets on restart - acceptable for portfolio)
const rateLimitStore = new Map();

// In-memory idempotency store (Key -> Response)
const idempotencyStore = new Map();

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const IDEMPOTENCY_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMITS = {
    auth: 5,        // 5 login/logout attempts
    upload: 10,     // 10 uploads
    publish: 2,     // 2 publish attempts
    public: 60,     // 60 general API requests
};

function checkRateLimit(ip, type) {
    const now = Date.now();
    const limit = RATE_LIMITS[type] || RATE_LIMITS.public;
    const key = `${ip}:${type}`;

    const record = rateLimitStore.get(key);

    // Cleanup old
    if (record && now - record.start > RATE_LIMIT_WINDOW) {
        rateLimitStore.delete(key);
    }

    if (!record || now - record.start > RATE_LIMIT_WINDOW) {
        rateLimitStore.set(key, { count: 1, start: now });
        return { allowed: true, remaining: limit - 1 };
    }

    if (record.count >= limit) {
        return {
            allowed: false,
            retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - record.start)) / 1000)
        };
    }

    record.count++;
    return { allowed: true, remaining: limit - record.count };
}

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const isProd = process.env.NODE_ENV === 'production';
    const requestId = crypto.randomUUID();

    // 1. HTTPS Enforcement (Production Only)
    // Vercel handles this mostly, but good to enforce.
    if (isProd) {
        const proto = request.headers.get('x-forwarded-proto');
        if (proto && proto !== 'https') {
            return NextResponse.redirect(
                `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
                301
            );
        }
    }

    // 2. API Firewall & Rate Limiting
    if (pathname.startsWith('/api/')) {
        let type = 'public';
        if (pathname.startsWith('/api/auth')) type = 'auth';
        if (pathname.startsWith('/api/upload')) type = 'upload';
        if (pathname.startsWith('/api/publish')) type = 'publish';

        const status = checkRateLimit(ip, type);

        if (!status.allowed) {
            return new NextResponse(
                JSON.stringify({ error: 'Rate limit exceeded', retryAfter: status.retryAfter }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': String(status.retryAfter),
                        'x-request-id': requestId
                    }
                }
            );
        }

        // Idempotency Check (POST/PUT only) - Placeholder
    }

    // 3. Admin Route Protection
    if (pathname.startsWith('/admin')) {
        // Allow public access to login page
        if (pathname === '/admin/login') {
            // Check if already logged in? Redirect to dashboard if so?
            const cookieName = isProd ? '__Host-admin_session' : 'admin_session';
            const token = request.cookies.get(cookieName)?.value;
            if (token) {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            return NextResponse.next();
        }

        // Protect all other admin routes
        const cookieName = isProd ? '__Host-admin_session' : 'admin_session';
        const token = request.cookies.get(cookieName)?.value;

        if (!token) {
            // Redirect to login
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Note: Full token verification (signature) happens in the API/Server Components via lib/auth.
        // Middleware just checks presence to avoid unauth rendering.
        // If token is invalid/expired, the API/Server Component will reject/redirect, 
        // causing a "double check" but that's fine for security depth.
    }

    const response = NextResponse.next();

    // 3. Observability & Security Headers
    const headers = response.headers;
    headers.set('x-request-id', requestId);

    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    // Allow scripts/styles from self and safe CDNs (Google Fonts)
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js needs eval in dev, strict in prod? kept permissive for now to avoid breakage
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "media-src 'self' blob: https:",
        "connect-src 'self' https:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; ');

    headers.set('Content-Security-Policy', csp);

    // Permissions Policy
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

    // HSTS (Prod only)
    if (isProd) {
        headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};

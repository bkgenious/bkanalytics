/**
 * Enhanced Authentication utilities with production security
 * Uses environment-based credentials with secure token handling
 */

import crypto from 'crypto';

// Get credentials from environment with validation
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Validate required environment variables
if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !SESSION_SECRET) {
    console.warn(
        '⚠️  Warning: Missing authentication environment variables. ' +
        'Set ADMIN_USERNAME, ADMIN_PASSWORD, and SESSION_SECRET in .env.local'
    );
}

// Session configuration
const SESSION_MAX_AGE = 8 * 60 * 60 * 1000; // 8 hours (reduced from 24)
const TOKEN_VERSION = 'v2'; // Increment to invalidate all existing sessions

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function secureCompare(a, b) {
    if (!a || !b) return false;

    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    if (bufA.length !== bufB.length) {
        // Compare with dummy to maintain constant time
        crypto.timingSafeEqual(bufA, bufA);
        return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Hash password with salt for comparison
 */
function hashCredential(credential, salt) {
    return crypto
        .createHmac('sha256', salt)
        .update(credential)
        .digest('hex');
}

/**
 * Validates admin credentials using timing-safe comparison
 * @param {string} username - Username to validate
 * @param {string} password - Password to validate
 * @returns {boolean} True if credentials are valid
 */
export function validateCredentials(username, password) {
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
        console.error('Authentication not configured');
        return false;
    }

    // Use timing-safe comparison to prevent timing attacks
    const usernameValid = secureCompare(username, ADMIN_USERNAME);
    const passwordValid = secureCompare(password, ADMIN_PASSWORD);

    return usernameValid && passwordValid;
}

/**
 * Generates a cryptographically secure session token
 * @param {string} username - Username for the session
 * @returns {string} Encrypted session token
 */
export function generateSessionToken(username) {
    if (!SESSION_SECRET) {
        throw new Error('SESSION_SECRET not configured');
    }

    const payload = {
        version: TOKEN_VERSION,
        username,
        timestamp: Date.now(),
        nonce: crypto.randomBytes(16).toString('hex'),
        fingerprint: crypto.randomBytes(8).toString('hex'),
    };

    // Create HMAC signature
    const signature = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

    // Encode payload and signature
    const token = Buffer.from(
        JSON.stringify({ ...payload, signature })
    ).toString('base64url'); // Use base64url for URL safety

    return token;
}

/**
 * Verifies a session token with enhanced security
 * @param {string} token - Token to verify
 * @returns {Object|null} Decoded payload if valid, null otherwise
 */
export function verifySessionToken(token) {
    if (!token || !SESSION_SECRET) return null;

    try {
        // Decode the token (handle both base64 and base64url)
        let decoded;
        try {
            decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
        } catch {
            decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        }

        const { signature, ...payload } = decoded;

        // Verify token version
        if (payload.version !== TOKEN_VERSION) {
            return null;
        }

        // Recreate the signature
        const expectedSignature = crypto
            .createHmac('sha256', SESSION_SECRET)
            .update(JSON.stringify(payload))
            .digest('hex');

        // Timing-safe comparison
        if (!secureCompare(signature, expectedSignature)) {
            return null;
        }

        // Check expiration
        if (Date.now() - payload.timestamp > SESSION_MAX_AGE) {
            return null;
        }

        return payload;
    } catch (error) {
        // Log for monitoring but don't expose details
        console.error('Token verification failed');
        return null;
    }
}

/**
 * Middleware helper to check authentication from request
 * @param {Request} request - Next.js request object
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated(request) {
    // Check for auth token in cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization') || '';

    // Extract token from cookie
    const cookieMatch = cookieHeader.match(/admin_token=([^;]+)/);
    const cookieToken = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;

    // Extract token from Authorization header (for API clients)
    const headerToken = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    const token = cookieToken || headerToken;

    if (!token) {
        return false;
    }

    const payload = verifySessionToken(token);
    return payload !== null;
}

/**
 * Creates secure authentication response headers with session cookie
 * @param {string} token - Session token
 * @param {boolean} isProduction - Whether running in production
 * @returns {Object} Headers object with Set-Cookie
 */
export function createAuthHeaders(token, isProduction = process.env.NODE_ENV === 'production') {
    const maxAge = SESSION_MAX_AGE / 1000; // Convert to seconds

    const cookieOptions = [
        `admin_token=${encodeURIComponent(token)}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Strict',
        `Max-Age=${maxAge}`,
    ];

    // Add Secure flag in production (requires HTTPS)
    if (isProduction) {
        cookieOptions.push('Secure');
    }

    return {
        'Set-Cookie': cookieOptions.join('; '),
    };
}

/**
 * Creates logout response headers (clears cookie)
 * @returns {Object} Headers object with cleared cookie
 */
export function createLogoutHeaders() {
    return {
        'Set-Cookie': 'admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
    };
}

/**
 * Generate a CSRF token for forms
 * @param {string} sessionToken - Current session token
 * @returns {string} CSRF token
 */
export function generateCSRFToken(sessionToken) {
    if (!SESSION_SECRET || !sessionToken) return '';

    return crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(`csrf:${sessionToken}:${Date.now()}`)
        .digest('hex')
        .substring(0, 32);
}

/**
 * Validate request origin to prevent CSRF
 * @param {Request} request - Incoming request
 * @returns {boolean} True if origin is valid
 */
export function validateRequestOrigin(request) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // In development, allow localhost
    if (process.env.NODE_ENV !== 'production') {
        return true;
    }

    // No origin header (same-origin request)
    if (!origin) {
        return true;
    }

    // Check that origin matches host
    try {
        const originHost = new URL(origin).host;
        return originHost === host;
    } catch {
        return false;
    }
}

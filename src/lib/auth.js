/**
 * Enhanced Authentication utilities with production security
 * Uses environment-based credentials with secure token handling
 */

import crypto from 'crypto';
import { isProduction, isCMS } from './env'; // We will create this next

// Get credentials from environment with validation
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // scrypt hash
const SESSION_SECRET = process.env.SESSION_SECRET;

// Validate required environment variables
if (!ADMIN_USERNAME || (!process.env.ADMIN_PASSWORD && !ADMIN_PASSWORD_HASH) || !SESSION_SECRET) {
    console.warn(
        '⚠️  Warning: Missing authentication environment variables. ' +
        'Set ADMIN_USERNAME, ADMIN_PASSWORD_HASH, and SESSION_SECRET in .env.local'
    );
}

// Session configuration
const SESSION_MAX_AGE = 8 * 60 * 60 * 1000; // 8 hours
const TOKEN_VERSION = 'v3'; // Increment to invalidate all existing sessions
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function secureCompare(a, b) {
    if (!a || !b) return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
        crypto.timingSafeEqual(bufA, bufA); // Constant time
        return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Generate a random salt
 */
function generateSalt(length = 16) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash password using scrypt
 */
export async function hashPassword(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, SCRYPT_PARAMS, (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
}

/**
 * Validates admin credentials using scrypt
 * Supports legacy plaintext fallback for migration (in-memory only)
 */
export async function validateCredentials(username, password) {
    if (!ADMIN_USERNAME) return false;

    // 1. Username check (timing safe)
    if (!secureCompare(username, ADMIN_USERNAME)) return false;

    // 2. Password check
    // If we have a hash in env, use it.
    if (ADMIN_PASSWORD_HASH) {
        const [salt, key] = ADMIN_PASSWORD_HASH.split(':');
        if (!salt || !key) {
            console.error('Invalid ADMIN_PASSWORD_HASH format');
            return false;
        }

        const derived = await hashPassword(password, salt);
        const [_, derivedKey] = derived.split(':');
        return secureCompare(key, derivedKey);
    }

    // Fallback: Plaintext env var (Legacy) - Warn user
    if (process.env.ADMIN_PASSWORD) {
        // Still use timing safe compare against plaintext
        return secureCompare(password, process.env.ADMIN_PASSWORD);
    }

    return false;
}

/**
 * Generates a cryptographically secure session token
 */
export function generateSessionToken(username) {
    if (!SESSION_SECRET) throw new Error('SESSION_SECRET not configured');

    const payload = {
        v: TOKEN_VERSION,
        uid: username,
        iat: Date.now(),
        exp: Date.now() + SESSION_MAX_AGE,
        nonce: crypto.randomBytes(16).toString('hex'),
        env: isProduction() ? 'prod' : 'dev', // Bind to environment
    };

    // Create HMAC signature
    const signature = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(JSON.stringify(payload))
        .digest('base64url');

    // Encode payload and signature
    return Buffer.from(
        JSON.stringify({ ...payload, sig: signature })
    ).toString('base64url');
}

/**
 * Verifies a session token with enhanced security
 */
export function verifySessionToken(token) {
    if (!token || !SESSION_SECRET) return null;

    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
        const { sig, ...payload } = decoded;

        // 1. Verify Version
        if (payload.v !== TOKEN_VERSION) return null;

        // 2. Verify Expiry
        if (Date.now() > payload.exp) return null;

        // 3. Verify Environment Fingerprint
        const currentEnv = isProduction() ? 'prod' : 'dev';
        if (payload.env !== currentEnv) return null; // Prevent dev tokens in prod

        // 4. Verify Signature
        const expectedSig = crypto
            .createHmac('sha256', SESSION_SECRET)
            .update(JSON.stringify(payload))
            .digest('base64url');

        if (!secureCompare(sig, expectedSig)) return null;

        return payload;
    } catch (error) {
        return null;
    }
}

/**
 * Middleware helper to check authentication from request
 */
export function isAuthenticated(request) {
    // Determine cookie name based on environment
    const cookieName = isProduction() ? '__Host-admin_session' : 'admin_session';

    const cookieHeader = request.headers.get('cookie') || '';
    const authHeader = request.headers.get('authorization') || '';

    // Regex to find specific cookie
    const cookieRegex = new RegExp(`${cookieName}=([^;]+)`);
    const cookieMatch = cookieHeader.match(cookieRegex);
    const cookieToken = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;

    const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || headerToken;

    if (!token) return false;

    const payload = verifySessionToken(token);
    return payload !== null;
}

/**
 * Creates secure authentication response headers with session cookie
 */
export function createAuthHeaders(token) {
    const maxAge = SESSION_MAX_AGE / 1000;
    const prod = isProduction();
    const cookieName = prod ? '__Host-admin_session' : 'admin_session';

    const cookieOptions = [
        `${cookieName}=${encodeURIComponent(token)}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Strict',
        `Max-Age=${maxAge}`,
    ];

    if (prod) {
        cookieOptions.push('Secure');
    }

    return {
        'Set-Cookie': cookieOptions.join('; '),
    };
}

/**
 * Creates logout response headers
 */
export function createLogoutHeaders() {
    const prod = process.env.NODE_ENV === 'production';
    const cookieName = prod ? '__Host-admin_session' : 'admin_session';

    return {
        'Set-Cookie': `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
    };
}

/**
 * Validate request origin to prevent CSRF
 */
export function validateRequestOrigin(request) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // In dev, be lenient but still check if Origin is present
    if (!isProduction()) {
        if (origin) {
            try {
                const originUrl = new URL(origin);
                return originUrl.host === host;
            } catch { return false; }
        }
        return true;
    }

    // Production: Strict Logic
    if (!origin) return true; // Server-to-server or non-browser allowed if no origin? 
    // Actually, strictly block cross-origin POSTs.
    // If standard browser POST, Origin is sent.

    try {
        const originUrl = new URL(origin);
        return originUrl.host === host; // Must match exact host
    } catch {
        return false;
    }
}

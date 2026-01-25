/**
 * Enterprise API Client
 * Wraps fetch with standardized error handling and response parsing.
 */
const BASE_URL = '/api';

export class ApiError extends Error {
    constructor(message, code, status, details = null) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

/**
 * Generic fetch wrapper
 * @template T
 * @param {string} endpoint 
 * @param {RequestInit} [options] 
 * @returns {Promise<T>}
 */
async function fetcher(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    let response;
    try {
        response = await fetch(url, config);
    } catch (networkError) {
        throw new ApiError('Network Error: Failed to reach server', 'NETWORK_ERROR', 0);
    }

    // Handle 204 No Content (if used)
    if (response.status === 204) return null;

    let payload;
    try {
        payload = await response.json();
    } catch (e) {
        // Fallback for non-JSON responses
        if (!response.ok) {
            throw new ApiError(response.statusText, 'HTTP_ERROR', response.status);
        }
    }

    // Enterprise Response Format Handling
    // Expected: { success: boolean, data?: T, error?: { message, code, details } }

    if (!response.ok) {
        // 4xx/5xx responses
        if (payload?.error) {
            throw new ApiError(
                payload.error.message || 'An error occurred',
                payload.error.code || 'UNKNOWN_ERROR',
                response.status,
                payload.error.details
            );
        }
        throw new ApiError(response.statusText, 'HTTP_ERROR', response.status);
    }

    // Success responses might also wrap data
    if (payload && typeof payload === 'object' && 'success' in payload) {
        if (!payload.success) {
            // Logic error returned with 200 OK? (Shouldn't happen with our API spec, but safety first)
            throw new ApiError(
                payload.error?.message || 'Operation failed',
                payload.error?.code || 'OPERATION_FAILED',
                200
            );
        }
        return payload.data;
    }

    // Raw response fallback (e.g. for simple endpoints not yet migrated)
    return payload;
}

export const api = {
    get: (url) => fetcher(url, { method: 'GET' }),
    post: (url, body) => fetcher(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Idempotency-Key': crypto.randomUUID() }
    }),
    put: (url, body) => fetcher(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { 'Idempotency-Key': crypto.randomUUID() }
    }),
    delete: (url) => fetcher(url, { method: 'DELETE' }),
    // SWR fetcher
    fetcher
};

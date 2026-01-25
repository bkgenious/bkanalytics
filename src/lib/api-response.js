/**
 * @typedef {Object} ApiResponseOptions
 * @property {number} [status=200]
 * @property {Record<string, any>} [meta]
 * @property {Record<string, string>} [headers]
 */

import { NextResponse } from 'next/server';

/**
 * Standard Success Response
 * @param {any} data 
 * @param {ApiResponseOptions} options 
 */
export function apiResponse(data, options = {}) {
    const { status = 200, meta, headers = {} } = options;

    return NextResponse.json({
        success: true,
        data,
        meta,
        requestId: crypto.randomUUID(), // Will be overwritten by middleware if present
    }, { status, headers });
}

/**
 * Standard Error Response
 * @param {string} message 
 * @param {string} code 
 * @param {number} status 
 * @param {any} [details] 
 */
export function apiError(message, code = 'INTERNAL_ERROR', status = 500, details = null) {
    return NextResponse.json({
        success: false,
        error: {
            code,
            message,
            details
        },
        requestId: crypto.randomUUID(),
    }, { status });
}

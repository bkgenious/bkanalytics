/**
 * File Upload API Route - Enterprise Grade
 * POST - Upload files (admin protected)
 * Uses native App Router multipart handling with enhanced security
 */

import { NextResponse } from 'next/server';
import { isAuthenticated, validateRequestOrigin } from '@/lib/auth';
import { processFormDataFiles, ensureUploadDirs } from '@/lib/upload';
import { apiResponse, apiError } from '@/lib/api-response';

// Runtime configuration
export const runtime = 'nodejs';

// Increase body size limit for uploads
export const dynamic = 'force-dynamic';

// POST /api/upload - Admin protected
export async function POST(request) {
    try {
        // Validate request origin (CSRF protection)
        if (!validateRequestOrigin(request)) {
            return apiError('Invalid request origin', 'FORBIDDEN', 403);
        }

        // Check authentication
        if (!isAuthenticated(request)) {
            return apiError('Unauthorized', 'UNAUTHORIZED', 401);
        }

        // Check content type
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            return apiError('Content-Type must be multipart/form-data', 'BAD_REQUEST', 400);
        }

        // Ensure upload directories exist
        ensureUploadDirs();

        // Parse multipart form data
        let formData;
        try {
            formData = await request.formData();
        } catch (error) {
            console.error('FormData parse error:', error);
            return apiError('Failed to parse upload data', 'BAD_REQUEST', 400);
        }

        // Process uploaded files with security checks
        const results = await processFormDataFiles(formData);

        // Calculate success stats
        const totalUploaded = results.images.length + results.videos.length + results.pdfs.length;
        const hasErrors = results.errors.length > 0;

        // Return appropriate response
        if (totalUploaded === 0 && hasErrors) {
            return apiError('All uploads failed', 'UPLOAD_ERROR', 400, {
                errors: results.errors
            });
        }

        return apiResponse({
            images: results.images,
            videos: results.videos,
            pdfs: results.pdfs,
            errors: hasErrors ? results.errors : undefined,
            message: hasErrors
                ? `Uploaded ${totalUploaded} file(s) with ${results.errors.length} error(s)`
                : `Successfully uploaded ${totalUploaded} file(s)`,
        });

    } catch (error) {
        console.error('Upload error:', error);
        return apiError('Upload failed. Please try again.', 'INTERNAL_ERROR', 500);
    }
}

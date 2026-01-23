/**
 * File Upload API Route - Production Hardened
 * POST - Upload files (admin protected)
 * Uses native App Router multipart handling with enhanced security
 */

import { NextResponse } from 'next/server';
import { isAuthenticated, validateRequestOrigin } from '@/lib/auth';
import { processFormDataFiles, ensureUploadDirs } from '@/lib/upload';
import { createErrorResponse } from '@/lib/validation';

// Runtime configuration
export const runtime = 'nodejs';

// Increase body size limit for uploads
export const dynamic = 'force-dynamic';

// POST /api/upload - Admin protected
export async function POST(request) {
    try {
        // Validate request origin (CSRF protection)
        if (!validateRequestOrigin(request)) {
            return NextResponse.json(
                createErrorResponse('Invalid request origin', 403),
                { status: 403 }
            );
        }

        // Check authentication
        if (!isAuthenticated(request)) {
            return NextResponse.json(
                createErrorResponse('Unauthorized', 401),
                { status: 401 }
            );
        }

        // Check content type
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            return NextResponse.json(
                createErrorResponse('Content-Type must be multipart/form-data', 400),
                { status: 400 }
            );
        }

        // Ensure upload directories exist
        ensureUploadDirs();

        // Parse multipart form data
        let formData;
        try {
            formData = await request.formData();
        } catch (error) {
            console.error('FormData parse error:', error.message);
            return NextResponse.json(
                createErrorResponse('Failed to parse upload data', 400),
                { status: 400 }
            );
        }

        // Process uploaded files with security checks
        const results = await processFormDataFiles(formData);

        // Calculate success stats
        const totalUploaded = results.images.length + results.videos.length + results.pdfs.length;
        const hasErrors = results.errors.length > 0;

        // Return appropriate response
        if (totalUploaded === 0 && hasErrors) {
            return NextResponse.json({
                success: false,
                errors: results.errors,
                message: 'All uploads failed',
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            images: results.images,
            videos: results.videos,
            pdfs: results.pdfs,
            errors: hasErrors ? results.errors : undefined,
            message: hasErrors
                ? `Uploaded ${totalUploaded} file(s) with ${results.errors.length} error(s)`
                : `Successfully uploaded ${totalUploaded} file(s)`,
        });
    } catch (error) {
        console.error('Upload error:', error.message);
        return NextResponse.json(
            createErrorResponse('Upload failed. Please try again.', 500),
            { status: 500 }
        );
    }
}

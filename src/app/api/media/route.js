/**
 * Media API
 * Lists and manages uploaded files
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isProduction } from '@/lib/env'; // Corrected import
import { getMediaUsage } from '@/lib/db';
import { isAuthenticated, validateRequestOrigin } from '@/lib/auth';
import { createErrorResponse } from '@/lib/validation';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Helper to recursively finding files
function getAllFiles(dirPath, arrayOfFiles = []) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;

    const files = fs.readdirSync(dirPath);

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            // Store relative path from public/
            const relativePath = fullPath.replace(path.join(process.cwd(), 'public'), '').replace(/\\/g, '/');
            arrayOfFiles.push({
                path: relativePath,
                name: file,
                size: fs.statSync(fullPath).size,
                mtime: fs.statSync(fullPath).mtime,
                type: getFileType(file)
            });
        }
    });

    return arrayOfFiles;
}

function getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) return 'image';
    if (['.mp4', '.webm', '.mov'].includes(ext)) return 'video';
    if (['.pdf'].includes(ext)) return 'pdf';
    return 'document';
}

export async function GET(request) {
    if (!isAuthenticated(request)) {
        return NextResponse.json(createErrorResponse('Unauthorized', 401), { status: 401 });
    }

    try {
        const mediaUsage = getMediaUsage(); // returns { '/path/to.jpg': ['proj-id-1', 'proj-id-2'] }
        const files = getAllFiles(UPLOADS_DIR);

        // Enhance with usage data
        const enrichedFiles = files.map(file => ({
            ...file,
            usage: mediaUsage[file.path] || [], // Array of project IDs
            isUsed: (mediaUsage[file.path] || []).length > 0
        }));

        // Sort by date new to old
        enrichedFiles.sort((a, b) => b.mtime - a.mtime);

        return NextResponse.json(enrichedFiles);
    } catch (error) {
        console.error('Media fetch error:', error);
        return NextResponse.json(createErrorResponse('Failed to fetch media', 500), { status: 500 });
    }
}

export async function DELETE(request) {
    if (!validateRequestOrigin(request)) {
        return NextResponse.json(createErrorResponse('Invalid origin', 403), { status: 403 });
    }

    if (!isAuthenticated(request)) {
        return NextResponse.json(createErrorResponse('Unauthorized', 401), { status: 401 });
    }

    if (isProduction()) {
        return NextResponse.json(createErrorResponse('Read-only in production', 403), { status: 403 });
    }

    try {
        const { filePath } = await request.json();

        // Security: Validate path
        if (!filePath || !filePath.startsWith('/uploads/') || filePath.includes('..')) {
            return NextResponse.json(createErrorResponse('Invalid file path', 400), { status: 400 });
        }

        const mediaUsage = getMediaUsage();
        if (mediaUsage[filePath] && mediaUsage[filePath].length > 0) {
            return NextResponse.json(createErrorResponse(`Cannot delete: Used in ${mediaUsage[filePath].length} projects`, 409), { status: 409 });
        }

        const fullPath = path.join(process.cwd(), 'public', filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(createErrorResponse('File not found', 404), { status: 404 });
        }

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(createErrorResponse('Failed to delete file', 500), { status: 500 });
    }
}

/**
 * Enhanced file upload utilities for production
 * Includes validation, sanitization, and security measures
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Upload directories
const UPLOAD_BASE = path.join(process.cwd(), 'public', 'uploads');
const UPLOAD_DIRS = {
    images: path.join(UPLOAD_BASE, 'images'),
    videos: path.join(UPLOAD_BASE, 'videos'),
    pdfs: path.join(UPLOAD_BASE, 'pdfs'),
    documents: path.join(UPLOAD_BASE, 'documents'),
};

// Allowed MIME types with magic number validation
const ALLOWED_TYPES = {
    images: {
        'image/jpeg': { ext: '.jpg', magic: [0xFF, 0xD8, 0xFF] },
        'image/png': { ext: '.png', magic: [0x89, 0x50, 0x4E, 0x47] },
        'image/gif': { ext: '.gif', magic: [0x47, 0x49, 0x46] },
        'image/webp': { ext: '.webp', magic: [0x52, 0x49, 0x46, 0x46] },
    },
    videos: {
        'video/mp4': { ext: '.mp4', magic: null }, // MP4 has variable headers
        'video/webm': { ext: '.webm', magic: [0x1A, 0x45, 0xDF, 0xA3] },
        'video/ogg': { ext: '.ogg', magic: [0x4F, 0x67, 0x67, 0x53] },
    },
    pdfs: {
        'application/pdf': { ext: '.pdf', magic: [0x25, 0x50, 0x44, 0x46] },
    },
    documents: {
        'application/msword': { ext: '.doc', magic: [0xD0, 0xCF, 0x11, 0xE0] },
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', magic: [0x50, 0x4B, 0x03, 0x04] }, // ZIP signature
        'text/plain': { ext: '.txt', magic: null },
    }
};

// Max file sizes (in bytes)
const MAX_SIZES = {
    images: 10 * 1024 * 1024,   // 10MB
    videos: 100 * 1024 * 1024,  // 100MB
    pdfs: 20 * 1024 * 1024,     // 20MB
    documents: 10 * 1024 * 1024,// 10MB
};

// Total upload limit per request
const MAX_TOTAL_SIZE = 150 * 1024 * 1024; // 150MB

/**
 * Ensures upload directories exist with proper permissions
 */
export function ensureUploadDirs() {
    Object.values(UPLOAD_DIRS).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
        }
    });
}

/**
 * Validates file magic numbers to prevent MIME type spoofing
 * @param {Buffer} buffer - File buffer
 * @param {Array} expectedMagic - Expected magic bytes
 * @returns {boolean} True if magic number matches
 */
function validateMagicNumber(buffer, expectedMagic) {
    if (!expectedMagic || !buffer || buffer.length < expectedMagic.length) {
        return expectedMagic === null; // null means no magic check needed
    }

    for (let i = 0; i < expectedMagic.length; i++) {
        if (buffer[i] !== expectedMagic[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Determines the file category from MIME type
 * @param {string} mimeType - MIME type of the file
 * @returns {{ category: string, typeInfo: object }|null} Category info or null
 */
export function getFileCategory(mimeType) {
    for (const [category, types] of Object.entries(ALLOWED_TYPES)) {
        if (types[mimeType]) {
            return { category, typeInfo: types[mimeType] };
        }
    }
    return null;
}

/**
 * Sanitizes filename to prevent path traversal and other attacks
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
    // Remove path separators and null bytes
    let sanitized = filename
        .replace(/[\/\\]/g, '')
        .replace(/\0/g, '')
        .replace(/\.\./g, '');

    // Only allow alphanumeric, dash, underscore, dot
    sanitized = sanitized.replace(/[^a-zA-Z0-9\-_.]/g, '_');

    // Limit length
    if (sanitized.length > 100) {
        sanitized = sanitized.substring(0, 100);
    }

    return sanitized || 'file';
}

/**
 * Generates a unique, secure filename
 * @param {string} originalName - Original filename
 * @param {string} ext - File extension
 * @returns {string} Unique filename
 */
export function generateUniqueFilename(originalName, ext) {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const sanitizedBase = sanitizeFilename(path.basename(originalName, path.extname(originalName)));

    // Format: timestamp-random-sanitizedname.ext
    return `${timestamp}-${randomBytes}-${sanitizedBase.substring(0, 20)}${ext}`;
}

/**
 * Validates a file with enhanced security checks
 * @param {File} file - File object from FormData
 * @param {Buffer} buffer - File buffer for magic number check
 * @returns {Object} Validation result
 */
export async function validateFile(file, buffer) {
    const categoryInfo = getFileCategory(file.type);

    if (!categoryInfo) {
        return {
            valid: false,
            error: `File type "${file.type}" is not allowed. Allowed types: Images, Videos, PDFs, Documents (DOC/DOCX/TXT)`,
        };
    }

    const { category, typeInfo } = categoryInfo;

    // Check file size
    const maxSize = MAX_SIZES[category];
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File exceeds maximum size of ${Math.round(maxSize / (1024 * 1024))}MB for ${category}`,
        };
    }

    // Validate magic number to prevent MIME type spoofing
    if (typeInfo.magic && !validateMagicNumber(buffer, typeInfo.magic)) {
        return {
            valid: false,
            error: `File content does not match declared type "${file.type}". File may be corrupted or mislabeled.`,
        };
    }

    return {
        valid: true,
        category,
        extension: typeInfo.ext,
    };
}

/**
 * Saves a file to the appropriate directory with security checks
 * @param {File} file - File object from FormData
 * @returns {Promise<Object>} Result with path or error
 */
export async function saveFile(file) {
    try {
        ensureUploadDirs();

        // Get file buffer for validation
        const buffer = Buffer.from(await file.arrayBuffer());

        // Validate file
        const validation = await validateFile(file, buffer);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        const { category, extension } = validation;
        const uniqueFilename = generateUniqueFilename(file.name, extension);
        const uploadDir = UPLOAD_DIRS[category];
        const filePath = path.join(uploadDir, uniqueFilename);

        // Verify the resolved path is within upload directory (prevent path traversal)
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(path.resolve(uploadDir))) {
            return { success: false, error: 'Invalid file path' };
        }

        // Write file atomically (write to temp, then rename)
        const tempPath = `${filePath}.tmp`;
        fs.writeFileSync(tempPath, buffer, { mode: 0o644 });
        fs.renameSync(tempPath, filePath);

        // Return public path (relative to /public)
        const publicPath = `/uploads/${category}/${uniqueFilename}`;

        return {
            success: true,
            path: publicPath,
            category,
            filename: uniqueFilename,
            originalName: sanitizeFilename(file.name),
            size: file.size,
            type: file.type,
        };
    } catch (error) {
        console.error('File save error:', error.message);
        return { success: false, error: 'Failed to save file. Please try again.' };
    }
}

/**
 * Deletes a file from the uploads directory with validation
 * @param {string} publicPath - Public path of the file
 * @returns {boolean} True if deleted successfully
 */
export function deleteFile(publicPath) {
    if (!publicPath || typeof publicPath !== 'string') return true;

    try {
        // Validate path format
        if (!publicPath.startsWith('/uploads/')) {
            return false;
        }

        const fullPath = path.join(process.cwd(), 'public', publicPath);
        const resolvedPath = path.resolve(fullPath);

        // Verify path is within uploads directory
        if (!resolvedPath.startsWith(path.resolve(UPLOAD_BASE))) {
            console.error('Attempted to delete file outside uploads directory');
            return false;
        }

        if (fs.existsSync(resolvedPath)) {
            fs.unlinkSync(resolvedPath);
        }
        return true;
    } catch (error) {
        console.error('File delete error:', error.message);
        return false;
    }
}

/**
 * Processes multiple files from FormData with total size limit
 * @param {FormData} formData - Form data containing files
 * @returns {Promise<Object>} Result with saved file paths
 */
export async function processFormDataFiles(formData) {
    const results = {
        images: [],
        videos: [],
        pdfs: [],
        documents: [],
        errors: [],
    };

    let totalSize = 0;
    const files = [];

    // Collect all files and check total size
    for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
            totalSize += value.size;
            files.push(value);
        }
    }

    // Check total size limit
    if (totalSize > MAX_TOTAL_SIZE) {
        results.errors.push({
            file: 'total',
            error: `Total upload size exceeds ${Math.round(MAX_TOTAL_SIZE / (1024 * 1024))}MB limit`,
        });
        return results;
    }

    // Process files
    for (const file of files) {
        const result = await saveFile(file);

        if (result.success) {
            if (result.category === 'images') {
                results.images.push(result.path);
            } else if (result.category === 'videos') {
                results.videos.push(result.path);
            } else if (result.category === 'pdfs') {
                results.pdfs.push(result.path);
            } else if (result.category === 'documents') {
                results.documents.push(result.path);
            }
        } else {
            results.errors.push({ file: file.name, error: result.error });
        }
    }

    return results;
}

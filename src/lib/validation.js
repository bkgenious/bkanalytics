/**
 * Input validation and sanitization utilities
 * For use across API routes
 */

/**
 * Sanitizes a string for safe storage and display
 * @param {string} input - Raw input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export function sanitizeString(input, maxLength = 1000) {
    if (typeof input !== 'string') {
        return '';
    }

    return input
        .trim()
        // Remove null bytes
        .replace(/\0/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        // Limit length
        .substring(0, maxLength);
}

/**
 * Sanitizes HTML to prevent XSS
 * Only allows safe text content
 * @param {string} input - Raw HTML string
 * @returns {string} Sanitized string
 */
export function sanitizeHTML(input) {
    if (typeof input !== 'string') {
        return '';
    }

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/**
 * Validates a project data object
 * @param {Object} data - Project data
 * @returns {{ valid: boolean, errors: string[], sanitized: Object }}
 */
export function validateProjectData(data) {
    const errors = [];
    const sanitized = {};

    // Title - required, 1-200 chars
    if (!data.title || typeof data.title !== 'string') {
        errors.push('Title is required');
    } else {
        sanitized.title = sanitizeString(data.title, 200);
        if (sanitized.title.length < 1) {
            errors.push('Title cannot be empty');
        }
    }

    // Description - optional, max 5000 chars
    if (data.description !== undefined) {
        sanitized.description = sanitizeString(data.description, 5000);
    } else {
        sanitized.description = '';
    }

    // Tool - required, must be valid option
    const validTools = ['Power BI', 'Tableau', 'Excel'];
    if (!data.tool || !validTools.includes(data.tool)) {
        errors.push(`Tool must be one of: ${validTools.join(', ')}`);
    } else {
        sanitized.tool = data.tool;
    }

    // Status - optional, default published
    const validStatus = ['published', 'draft'];
    if (data.status !== undefined) {
        if (!validStatus.includes(data.status)) {
            errors.push('Status must be published or draft');
        } else {
            sanitized.status = data.status;
        }
    } else {
        sanitized.status = 'published';
    }

    // Order - optional, number
    if (data.order !== undefined) {
        const orderNum = parseInt(data.order, 10);
        if (isNaN(orderNum)) {
            errors.push('Order must be a number');
        } else {
            sanitized.order = orderNum;
        }
    }
    // Note: If order is missing, db.js handles auto-increment

    // Tags - optional, array of strings
    if (data.tags !== undefined) {
        if (!Array.isArray(data.tags)) {
            errors.push('Tags must be an array');
        } else {
            sanitized.tags = data.tags
                .filter(tag => typeof tag === 'string')
                .map(tag => sanitizeString(tag, 50))
                .filter(tag => tag.length > 0)
                .slice(0, 20); // Max 20 tags
        }
    } else {
        sanitized.tags = [];
    }

    // Images - optional, array of valid paths
    if (data.images !== undefined) {
        if (!Array.isArray(data.images)) {
            errors.push('Images must be an array');
        } else {
            sanitized.images = data.images
                .filter(img => typeof img === 'string' && isValidUploadPath(img))
                .slice(0, 50); // Max 50 images
        }
    } else {
        sanitized.images = [];
    }

    // Documents - optional, array of valid paths
    if (data.documents !== undefined) {
        if (!Array.isArray(data.documents)) {
            errors.push('Documents must be an array');
        } else {
            sanitized.documents = data.documents
                .filter(doc => typeof doc === 'string' && isValidUploadPath(doc))
                .slice(0, 20); // Max 20 documents
        }
    } else {
        sanitized.documents = [];
    }

    // Video - optional, single valid path
    if (data.video !== undefined && data.video !== null) {
        if (typeof data.video !== 'string' || !isValidUploadPath(data.video)) {
            errors.push('Invalid video path');
        } else {
            sanitized.video = data.video;
        }
    } else {
        sanitized.video = null;
    }

    // PDF - optional, single valid path
    if (data.pdf !== undefined && data.pdf !== null) {
        if (typeof data.pdf !== 'string' || !isValidUploadPath(data.pdf)) {
            errors.push('Invalid PDF path');
        } else {
            sanitized.pdf = data.pdf;
        }
    } else {
        sanitized.pdf = null;
    }

    // Thumbnail - optional, single valid path
    if (data.thumbnail !== undefined && data.thumbnail !== null) {
        if (typeof data.thumbnail !== 'string' || !isValidUploadPath(data.thumbnail)) {
            errors.push('Invalid thumbnail path');
        } else {
            sanitized.thumbnail = data.thumbnail;
        }
    } else {
        sanitized.thumbnail = null;
    }

    return {
        valid: errors.length === 0,
        errors,
        sanitized,
    };
}

/**
 * Validates that a path is a valid upload path
 * @param {string} filePath - Path to validate
 * @returns {boolean} True if valid
 */
export function isValidUploadPath(filePath) {
    if (typeof filePath !== 'string') return false;

    // Must start with /uploads/
    if (!filePath.startsWith('/uploads/')) return false;

    // Must be in one of the valid subdirectories
    const validPrefixes = [
        '/uploads/images/',
        '/uploads/videos/',
        '/uploads/pdfs/',
        '/uploads/documents/'
    ];
    if (!validPrefixes.some(prefix => filePath.startsWith(prefix))) return false;

    // No path traversal
    if (filePath.includes('..') || filePath.includes('//')) return false;

    // Valid characters only
    const filename = filePath.split('/').pop();
    if (!/^[a-zA-Z0-9\-_.]+$/.test(filename)) return false;

    return true;
}

/**
 * Validates UUID format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid UUID
 */
export function isValidUUID(id) {
    if (typeof id !== 'string') return false;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id) || id.startsWith('sample-'); // Allow sample IDs
}

/**
 * Creates a consistent error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Object} Error response object
 */
export function createErrorResponse(message, status = 400) {
    return {
        error: message,
        status,
        timestamp: new Date().toISOString(),
    };
}

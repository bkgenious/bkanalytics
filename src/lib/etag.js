import crypto from 'crypto';

/**
 * Generates a sticky ETag for a dataset.
 * @param {any} data - The data to hash (usually the projects array)
 * @returns {string} - The ETag string (e.g. W/"hash")
 */
export function generateETag(data) {
    const json = JSON.stringify(data);
    const hash = crypto.createHash('md5').update(json).digest('hex');
    return `W/"${hash}"`;
}

/**
 * Metrics Aggregation Service
 * Calculates real-time stats from database and configuration
 * Includes in-memory caching for performance
 */

import { getAllProjects } from './db';
import { getConfig } from './config';

// In-memory cache
let metricsCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds

/**
 * Calculates metrics from fresh data
 * @returns {Object} Metrics object
 */
function calculateMetrics() {
    // 1. Fetch data
    const projects = getAllProjects();
    const config = getConfig();

    // 2. Filter for published projects only
    const publishedProjects = projects.filter(p => p.status === 'published');

    // 3. Aggregate Tool Counts
    const toolCounts = {
        'Power BI': 0,
        'Tableau': 0,
        'Excel': 0
    };

    publishedProjects.forEach(p => {
        if (toolCounts[p.tool] !== undefined) {
            toolCounts[p.tool]++;
        }
    });

    // 4. Aggregate Media Counts
    let totalImages = 0;
    let totalVideos = 0;
    let totalPdfs = 0;
    let totalDocuments = 0;

    publishedProjects.forEach(p => {
        // Safe access with fallbacks
        totalImages += Array.isArray(p.images) ? p.images.length : 0;
        if (p.video) totalVideos++;
        if (p.pdf) totalPdfs++;
        totalDocuments += Array.isArray(p.documents) ? p.documents.length : 0;
    });

    // 5. Construct Response
    return {
        totalProjects: publishedProjects.length,
        // Tool stats
        powerBI: toolCounts['Power BI'],
        tableau: toolCounts['Tableau'],
        excel: toolCounts['Excel'],
        // Media stats
        totalImages,
        totalVideos,
        totalPdfs,
        totalDocuments,
        totalMedia: totalImages + totalVideos + totalPdfs + totalDocuments,
        // Configurable stats
        experienceYears: config.experience,
        customStats: config.customStats || []
    };
}

/**
 * Gets application metrics with caching
 * @param {boolean} forceRefresh - If true, bypass cache
 * @returns {Object} Metrics object
 */
export function getMetrics(forceRefresh = false) {
    const now = Date.now();

    if (!forceRefresh && metricsCache && (now - lastCacheTime < CACHE_TTL)) {
        return metricsCache;
    }

    try {
        metricsCache = calculateMetrics();
        lastCacheTime = now;
        return metricsCache;
    } catch (error) {
        console.error('Failed to calculate metrics:', error);
        // Fallback to safe zero-values if calculation fails
        return {
            totalProjects: 0,
            powerBI: 0,
            tableau: 0,
            excel: 0,
            totalImages: 0,
            totalVideos: 0,
            totalPdfs: 0,
            totalDocuments: 0,
            totalMedia: 0,
            experienceYears: 0,
            customStats: []
        };
    }
}

/**
 * Invalidates the metrics cache
 * Call this when projects are modified
 */
export function invalidateMetricsCache() {
    metricsCache = null;
    lastCacheTime = 0;
}

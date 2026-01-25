/**
 * Activity Logging Module
 * Provides an audit trail for admin actions
 */

import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'data', 'activity.json');
const MAX_LOGS = 100; // Keep last 100 entries

/**
 * @typedef {'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'BACKUP'} ActionType
 */

/**
 * @typedef {Object} ActivityLogEntry
 * @property {string} id
 * @property {string} timestamp
 * @property {ActionType} action
 * @property {string} resource - e.g., 'project', 'media', 'config'
 * @property {string} [resourceId]
 * @property {string} [details]
 * @property {string} [actor] - Username or IP
 */

/**
 * Read all activity logs
 * @returns {ActivityLogEntry[]}
 */
export function getActivityLogs() {
    try {
        if (!fs.existsSync(LOG_FILE)) {
            return [];
        }
        const data = fs.readFileSync(LOG_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('[ActivityLog] Error reading logs:', error);
        return [];
    }
}

/**
 * Add a new activity log entry
 * @param {ActionType} action 
 * @param {string} resource 
 * @param {object} [options]
 * @param {string} [options.resourceId]
 * @param {string} [options.details]
 * @param {string} [options.actor]
 */
export function logActivity(action, resource, options = {}) {
    try {
        const logs = getActivityLogs();

        const entry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            action,
            resource,
            resourceId: options.resourceId,
            details: options.details,
            actor: options.actor || 'admin',
        };

        // Prepend new entry
        logs.unshift(entry);

        // Trim to max size
        const trimmedLogs = logs.slice(0, MAX_LOGS);

        // Write back
        fs.writeFileSync(LOG_FILE, JSON.stringify(trimmedLogs, null, 2));

        return entry;
    } catch (error) {
        console.error('[ActivityLog] Error writing log:', error);
        return null;
    }
}

/**
 * Clear all activity logs
 */
export function clearActivityLogs() {
    try {
        fs.writeFileSync(LOG_FILE, JSON.stringify([]));
    } catch (error) {
        console.error('[ActivityLog] Error clearing logs:', error);
    }
}

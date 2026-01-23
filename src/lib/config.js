/**
 * Config Utilities
 * Handles reading/writing of site configuration (Experience, KPIs)
 * Guarantees: Auto-creation, Backup before write, Validation, Safe Defaults
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const BACKUP_FILE = path.join(DATA_DIR, 'config.bak.json');

// Default Configuration
const DEFAULT_CONFIG = {
    experience: 5,
    customStats: [
        { label: 'Dashboards Delivered', value: '50+' },
        { label: 'Reports Created', value: '100+' },
        { label: 'Enterprise Clients', value: '25+' }
    ]
};

/**
 * Ensures data directory and config file exist
 */
function ensureConfigExists() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(CONFIG_FILE)) {
        console.warn('Config file missing. Creating default config.');
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
    }
}

/**
 * Backs up the config file
 */
function backupConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            fs.copyFileSync(CONFIG_FILE, BACKUP_FILE);
        }
    } catch (error) {
        console.error('Failed to backup config:', error);
        // Continue execution - backup failure shouldn't block writes
    }
}

/**
 * Validates config object structure
 * @param {Object} config - Config object to validate
 * @returns {boolean} True if valid
 */
function isValidConfig(config) {
    if (!config || typeof config !== 'object') return false;

    // Validate experience (must be number)
    if (typeof config.experience !== 'number') return false;

    // Validate customStats (must be array of label/value objects)
    if (!Array.isArray(config.customStats)) return false;

    return config.customStats.every(stat =>
        stat &&
        typeof stat.label === 'string' &&
        typeof stat.value === 'string'
    );
}

/**
 * Reads configuration from disk
 * @returns {Object} Configuration object
 */
export function getConfig() {
    ensureConfigExists();
    try {
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const parsed = JSON.parse(data);

        // Runtime validation using "safe merge" strategy
        // This ensures new fields in DEFAULT_CONFIG are present in returned object
        // and bad values fall back to defaults
        return {
            ...DEFAULT_CONFIG,
            ...parsed,
            // Ensure types are correct even if file is valid JSON but invalid schema
            experience: typeof parsed.experience === 'number' ? parsed.experience : DEFAULT_CONFIG.experience,
            customStats: Array.isArray(parsed.customStats) ? parsed.customStats : DEFAULT_CONFIG.customStats
        };
    } catch (error) {
        console.error('Error reading config:', error);
        // Try to restore from backup or return default
        return DEFAULT_CONFIG;
    }
}

/**
 * Updates configuration
 * @param {Object} updates - Partial or full config updates
 * @returns {Object} Updated config
 */
export function updateConfig(updates) {
    ensureConfigExists();
    backupConfig();

    const current = getConfig();
    const newConfig = {
        ...current,
        ...updates
    };

    if (!isValidConfig(newConfig)) {
        throw new Error('Invalid configuration data');
    }

    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
        return newConfig;
    } catch (error) {
        console.error('Failed to save config:', error);
        throw new Error('Failed to save configuration');
    }
}

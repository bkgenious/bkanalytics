/**
 * Database utility for JSON-based project storage
 * Handles all CRUD operations for projects
 * 
 * IMPLEMENTATION NOTE: This uses synchronous file operations for simplicity.
 * Rate limiting at reset-on-restart is acceptable for single-user personal use.
 * Not suitable for multi-user or high-concurrency scenarios.
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { canWrite } from './env';

// Path to the projects database file
const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const BACKUP_FILE = path.join(DATA_DIR, 'projects.bak.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const CONFIG_BACKUP_FILE = path.join(DATA_DIR, 'config.bak.json');

/**
 * Valid tool types
 */
const VALID_TOOLS = ['Power BI', 'Tableau', 'Excel'];

/**
 * Default Configuration
 */
const DEFAULT_CONFIG = {
    profile: {
        name: "Admin",
        role: "Data Analytics Expert",
        email: "contact@example.com",
        socials: { linkedin: "", github: "", twitter: "" }
    },
    hero: {
        headline: "Transforming data into strategic insights",
        subheadline: "I design enterprise-grade dashboards and analytics solutions that help organizations make confident, data-driven decisions.",
        ctaPrimary: "View Work",
        ctaSecondary: "Get in Touch"
    },
    about: {
        title: "Data solutions for complex challenges",
        description: "With over 5 years in data analytics, I help organizations unlock value from their data through powerful visualizations and strategic insights."
    },
    seo: {
        title: "DataViz Portfolio | Data Analytics & Visualization Expert",
        description: "Professional portfolio showcasing Power BI, Tableau, and Excel dashboards."
    },
    features: {
        showSkills: true,
        showContact: true
    },
    skills: [
        { tool: "Power BI", level: 95, description: "Enterprise dashboards, DAX measures, data modeling, and report optimization" },
        { tool: "Tableau", level: 90, description: "Interactive visualizations, calculated fields, and server deployment" },
        { tool: "Excel", level: 98, description: "Power Query, advanced formulas, data analysis, and VBA automation" }
    ]
};

/**
 * Ensures the data directory and projects file exist
 */
function ensureDataExists() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Create projects file with empty array if it doesn't exist
    if (!fs.existsSync(PROJECTS_FILE)) {
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }

    // Create config file with defaults if it doesn't exist
    if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
    }
}

/**
 * Creates a backup of the current projects file
 */
function backupProjectData() {
    try {
        if (fs.existsSync(PROJECTS_FILE)) {
            fs.copyFileSync(PROJECTS_FILE, BACKUP_FILE);
        }
    } catch (error) {
        console.error('Failed to create backup:', error);
        // Continue execution - backup failure shouldn't block writes
    }
}

/**
 * Restores data from backup if available
 * @returns {Array} Restored projects or empty array
 */
function restoreFromBackup() {
    try {
        if (fs.existsSync(BACKUP_FILE)) {
            const data = fs.readFileSync(BACKUP_FILE, 'utf-8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                console.warn('Restored projects from backup');
                fs.writeFileSync(PROJECTS_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
                return parsed;
            }
        }
    } catch (error) {
        console.error('Failed to restore from backup:', error);
    }
    return [];
}

/**
 * Validates project object has required shape before write
 * @param {Object} project - Project to validate
 * @returns {boolean} True if valid
 */
function isValidProjectShape(project) {
    if (!project || typeof project !== 'object') return false;
    if (typeof project.id !== 'string' || project.id.length === 0) return false;
    if (typeof project.title !== 'string' || project.title.length === 0) return false;
    if (!VALID_TOOLS.includes(project.tool)) return false;

    // Validate arrays
    if (!Array.isArray(project.tags)) return false;
    if (!Array.isArray(project.images)) return false;
    if (project.documents && !Array.isArray(project.documents)) return false;

    return true;
}

/**
 * Normalizes timestamps to ISO format
 * @param {string|undefined} timestamp 
 * @returns {string} ISO timestamp
 */
function normalizeTimestamp(timestamp) {
    if (!timestamp) return new Date().toISOString();
    try {
        return new Date(timestamp).toISOString();
    } catch {
        return new Date().toISOString();
    }
}

/**
 * Fixes a project object to match current schema
 * @param {Object} project - Raw project object
 * @returns {Object} Schema-compliant project
 */
function fixProjectSchema(project) {
    return {
        ...project,
        tags: Array.isArray(project.tags) ? project.tags : [],
        images: Array.isArray(project.images) ? project.images : [],
        // New fields
        status: project.status === 'draft' ? 'draft' : 'published', // Default to published
        order: typeof project.order === 'number' ? project.order : 0,
        documents: Array.isArray(project.documents) ? project.documents : [],
        embedUrl: typeof project.embedUrl === 'string' ? project.embedUrl : '',
        metaTitle: typeof project.metaTitle === 'string' ? project.metaTitle : '',
        metaDescription: typeof project.metaDescription === 'string' ? project.metaDescription : '',
        keywords: Array.isArray(project.keywords) ? project.keywords : [],
        history: Array.isArray(project.history) ? project.history : []
    };
}

/**
 * Reads all projects from the JSON file
 * @returns {Array} Array of project objects
 */
/**
 * Reads all projects from the JSON file
 * @param {boolean} includeDeleted - Whether to include soft-deleted projects
 * @returns {Array} Array of project objects
 */
export function getAllProjects(includeDeleted = false) {
    ensureDataExists();
    try {
        const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
        const parsed = JSON.parse(data);

        // Validate it's an array
        if (!Array.isArray(parsed)) {
            console.error('Projects file corrupted: not an array');
            return restoreFromBackup();
        }

        // Fix schema on read (self-healing)
        const projects = parsed.map(fixProjectSchema);

        // Filter deleted
        const activeProjects = includeDeleted
            ? projects
            : projects.filter(p => !p.deletedAt);

        return activeProjects.sort((a, b) => {
            // Sort by order (ascending), then date (newest first)
            if (a.order !== b.order) return a.order - b.order;
            // Negative date comparison for newest first
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    } catch (error) {
        console.error('Error reading projects:', error);
        return restoreFromBackup();
    }
}

// ... (getProjectById, createProject, updateProject remain similar but might need to respect deleted status if fetching by ID, 
// usually getById should return it even if deleted, or maybe not? 
// User said "Exclude deleted items by default". 
// I'll leave getById as is (wraps getAllProjects so it will exclude deleted).
// Wait, getProjectById calls getAllProjects() which defaults to false. So deleted projects return null. Correct.

/**
 * Deletes a project (Soft Delete)
 * @param {string} id - Project ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteProject(id) {
    if (!canWrite()) {
        throw new Error('Editing is only allowed in CMS Mode (Codespaces/Local). Production is read-only.');
    }

    ensureDataExists();
    // Backup before write
    backupProjectData();

    const projects = getAllProjects(true); // Get ALL including deleted to find it
    const index = projects.findIndex(p => p.id === id);

    if (index === -1) {
        return false;
    }

    // Soft Delete
    projects[index].deletedAt = new Date().toISOString();

    // Check if we should delete associated files? 
    // Soft delete implies keeping data. We should KEEP files for Restore capability.

    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');

    return true;
}

/**
 * Restores a soft-deleted project
 * @param {string} id 
 * @returns {boolean}
 */
export function restoreProject(id) {
    if (!canWrite()) {
        throw new Error('Editing is only allowed in CMS Mode (Codespaces/Local). Production is read-only.');
    }

    ensureDataExists();
    backupProjectData();

    const projects = getAllProjects(true);
    const index = projects.findIndex(p => p.id === id);

    if (index === -1) return false;

    if (projects[index].deletedAt) {
        delete projects[index].deletedAt;
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
        return true;
    }

    return false;
}

/**
 * Gets a single project by ID
 * @param {string} id - Project ID
 * @returns {Object|null} Project object or null if not found
 */
export function getProjectById(id) {
    const projects = getAllProjects();
    const project = projects.find(project => project.id === id);
    return project ? fixProjectSchema(project) : null;
}

/**
 * Creates a new project
 * @param {Object} projectData - Project data without ID
 * @returns {Object} Created project with generated ID
 * @throws {Error} If project data is invalid
 */
export function createProject(projectData) {
    if (!canWrite()) {
        throw new Error('Editing is only allowed in CMS Mode (Codespaces/Local). Production is read-only.');
    }

    ensureDataExists();
    // Backup before write
    backupProjectData();

    const projects = getAllProjects();
    const now = new Date().toISOString();

    // Auto-increment order
    const maxOrder = projects.reduce((max, p) => Math.max(max, p.order || 0), 0);

    const newProject = {
        id: uuidv4(),
        title: projectData.title || '',
        description: projectData.description || '',
        tool: projectData.tool,
        tags: Array.isArray(projectData.tags) ? projectData.tags : [],
        images: Array.isArray(projectData.images) ? projectData.images : [],
        video: projectData.video || null,
        pdf: projectData.pdf || null,
        thumbnail: projectData.thumbnail || null,
        // New fields
        status: projectData.status === 'draft' ? 'draft' : 'published',
        order: typeof projectData.order === 'number' ? projectData.order : maxOrder + 1,
        documents: Array.isArray(projectData.documents) ? projectData.documents : [],
        embedUrl: projectData.embedUrl || '',
        metaTitle: projectData.metaTitle || '',
        metaDescription: projectData.metaDescription || '',
        keywords: Array.isArray(projectData.keywords) ? projectData.keywords : [],
        history: [], // History starts empty for new project

        createdAt: now,
        updatedAt: now,
    };

    // Validate before write
    if (!isValidProjectShape(newProject)) {
        throw new Error('Invalid project data: missing required fields');
    }

    projects.push(newProject);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');

    return newProject;
}

/**
 * Creates a version snapshot of a project
 * @param {Object} oldProject 
 * @param {Object} newChanges 
 * @returns {Object} newVersionEntry
 */
function createVersionSnapshot(oldProject, newChanges) {
    const changedFields = {};
    let hasChanges = false;

    // Find what changed
    for (const [key, value] of Object.entries(newChanges)) {
        if (JSON.stringify(oldProject[key]) !== JSON.stringify(value)) {
            changedFields[key] = oldProject[key]; // Store OLD value for rollback
            hasChanges = true;
        }
    }

    if (!hasChanges) return null;

    return {
        timestamp: new Date().toISOString(),
        id: uuidv4().substring(0, 8), // Short ID
        changes: changedFields
    };
}

/**
 * Updates an existing project
 * @param {string} id - Project ID
 * @param {Object} updateData - Fields to update
 * @returns {Object|null} Updated project or null if not found
 */
export function updateProject(id, updateData) {
    if (!canWrite()) {
        throw new Error('Editing is only allowed in CMS Mode (Codespaces/Local). Production is read-only.');
    }

    ensureDataExists();
    // Backup before write
    backupProjectData();

    const projects = getAllProjects();
    const index = projects.findIndex(project => project.id === id);

    if (index === -1) {
        return null;
    }

    const existing = projects[index];

    // Defensive: ensure existing project exists
    if (!existing) {
        return null;
    }

    // Defensive: normalize history array
    existing.history = Array.isArray(existing.history) ? existing.history : [];

    // Create version snapshot before update using existing function
    const versionEntry = createVersionSnapshot(existing, updateData);

    const newHistory = [...existing.history];

    if (versionEntry) {
        newHistory.push(versionEntry);

        // Keep only last 10 versions to prevent bloat
        if (newHistory.length > 10) {
            newHistory.shift();
        }
    }

    // Merge existing data with updates
    const updatedProject = {
        ...existing,
        ...updateData,
        id: existing.id, // Prevent ID from being changed
        createdAt: normalizeTimestamp(existing.createdAt),
        updatedAt: new Date().toISOString(),
        history: newHistory
    };

    // Apply schema fix to ensure shape stability
    const fixedProject = fixProjectSchema(updatedProject);

    // Validate before write
    if (!isValidProjectShape(fixedProject)) {
        console.error('Update validation failed for project:', id);
        return null;
    }

    projects[index] = fixedProject;
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');

    return fixedProject;
}

/**
 * Duplicates an existing project
 * @param {string} id - Project ID to clone
 * @returns {Object|null} New project or null
 */
export function duplicateProject(id) {
    if (!canWrite()) {
        throw new Error('Editing is only allowed in CMS Mode (Codespaces/Local). Production is read-only.');
    }

    ensureDataExists();
    backupProjectData();

    const projects = getAllProjects();
    const source = projects.find(p => p.id === id);

    if (!source) return null;

    const now = new Date().toISOString();
    const maxOrder = projects.reduce((max, p) => Math.max(max, p.order || 0), 0);

    const clone = {
        ...source,
        id: uuidv4(),
        title: `${source.title} (Copy)`,
        status: 'draft', // Always duplicate as draft
        order: maxOrder + 1,
        history: [], // Reset history
        createdAt: now,
        updatedAt: now
    };

    projects.push(clone);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');

    return clone;
}


/**
 * Updates the sort order of all projects
 * @param {Array<{id: string, order: number}>} reorderedProjects
 */
export function updateProjectOrder(reorderedProjects) {
    if (!canWrite()) {
        throw new Error('Editing is only allowed in CMS Mode (Codespaces/Local). Production is read-only.');
    }

    ensureDataExists();
    backupProjectData();

    const projects = getAllProjects();
    let hasChanges = false;

    reorderedProjects.forEach(item => {
        const project = projects.find(p => p.id === item.id);
        if (project && project.order !== item.order) {
            project.order = item.order;
            hasChanges = true;
        }
    });

    if (hasChanges) {
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    }

    return true;
}

/**
 * Gets projects filtered by tool type
 * @param {string} tool - Tool type ('Power BI', 'Tableau', 'Excel')
 * @returns {Array} Filtered projects
 */
export function getProjectsByTool(tool) {
    const projects = getAllProjects();
    return projects.filter(project => project.tool === tool);
}

/**
 * Gets all unique tags from all projects
 * @returns {Array} Array of unique tags
 */
export function getAllTags() {
    const projects = getAllProjects();
    const tags = new Set();

    projects.forEach(project => {
        if (project.tags && Array.isArray(project.tags)) {
            project.tags.forEach(tag => tags.add(tag));
        }
    });

    return Array.from(tags);
}

/**
 * Analyzes media usage across all projects
 * @returns {Object} Map of file paths to array of project IDs using them
 */
export function getMediaUsage() {
    const projects = getAllProjects();
    const usage = {};

    function addUsage(path, projectId) {
        if (!path) return;
        if (!usage[path]) usage[path] = [];
        if (!usage[path].includes(projectId)) usage[path].push(projectId);
    }

    projects.forEach(p => {
        if (p.thumbnail) addUsage(p.thumbnail, p.id);
        if (p.video) addUsage(p.video, p.id);
        if (p.pdf) addUsage(p.pdf, p.id);
        if (Array.isArray(p.images)) p.images.forEach(img => addUsage(img, p.id));
        if (Array.isArray(p.documents)) p.documents.forEach(doc => addUsage(doc, p.id));
    });

    return usage;
}

// --- CONFIGURATION METHODS ---

/**
 * Creates a backup of the current config file
 */
function backupConfigData() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            fs.copyFileSync(CONFIG_FILE, CONFIG_BACKUP_FILE);
        }
    } catch (error) {
        console.error('Failed to create config backup:', error);
    }
}

/**
 * Reads the site configuration
 * @returns {Object} Configuration object
 */
export function getConfig() {
    ensureDataExists();
    try {
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const parsed = JSON.parse(data);

        // Merge with defaults to ensure all keys exist (schema migration)
        return { ...DEFAULT_CONFIG, ...parsed, profile: { ...DEFAULT_CONFIG.profile, ...parsed.profile }, hero: { ...DEFAULT_CONFIG.hero, ...parsed.hero } };
    } catch (error) {
        console.error('Error reading config:', error);
        return DEFAULT_CONFIG;
    }
}

/**
 * Updates the site configuration
 * @param {Object} newConfig - Partial or full config object
 * @returns {Object} Updated config
 */
export function updateConfig(newConfig) {
    if (!canWrite()) {
        throw new Error('Editing is only allowed in CMS Mode (Codespaces/Local). Production is read-only.');
    }

    ensureDataExists();
    backupConfigData();

    const current = getConfig();

    // Deep Merge (Simplified) - ideally use lodash.merge, but spread is fine for 2-3 levels if careful
    const updated = {
        ...current,
        ...newConfig,
        // Helper: Ensure sub-objects are merged, not overwritten if passing partials
        profile: { ...current.profile, ...(newConfig.profile || {}) },
        hero: { ...current.hero, ...(newConfig.hero || {}) },
        about: { ...current.about, ...(newConfig.about || {}) },
        seo: { ...current.seo, ...(newConfig.seo || {}) },
        features: { ...current.features, ...(newConfig.features || {}) },
        // Arrays are overwritten
        skills: Array.isArray(newConfig.skills) ? newConfig.skills : current.skills
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
}

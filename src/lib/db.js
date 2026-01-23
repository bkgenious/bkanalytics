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

// Path to the projects database file
const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const BACKUP_FILE = path.join(DATA_DIR, 'projects.bak.json');

/**
 * Valid tool types
 */
const VALID_TOOLS = ['Power BI', 'Tableau', 'Excel'];

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
    };
}

/**
 * Reads all projects from the JSON file
 * @returns {Array} Array of project objects
 */
export function getAllProjects() {
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
        return parsed.map(fixProjectSchema).sort((a, b) => {
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
 * Updates an existing project
 * @param {string} id - Project ID
 * @param {Object} updateData - Fields to update
 * @returns {Object|null} Updated project or null if not found
 */
export function updateProject(id, updateData) {
    ensureDataExists();
    // Backup before write
    backupProjectData();

    const projects = getAllProjects();
    const index = projects.findIndex(project => project.id === id);

    if (index === -1) {
        return null;
    }

    const existing = projects[index];

    // Merge existing data with updates
    const updatedProject = {
        ...existing,
        ...updateData,
        id: existing.id, // Prevent ID from being changed
        createdAt: normalizeTimestamp(existing.createdAt),
        updatedAt: new Date().toISOString(),
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
 * Safely deletes a file, ignoring errors if file doesn't exist
 * @param {string} filePath - Public path of the file
 */
function safeDeleteFile(filePath) {
    if (!filePath || typeof filePath !== 'string') return;

    try {
        const fullPath = path.join(process.cwd(), 'public', filePath);

        // Validate path is within uploads directory (security check)
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const resolvedPath = path.resolve(fullPath);
        if (!resolvedPath.startsWith(path.resolve(uploadsDir))) {
            console.error('Attempted to delete file outside uploads directory:', filePath);
            return;
        }

        if (fs.existsSync(resolvedPath)) {
            fs.unlinkSync(resolvedPath);
        }
    } catch (error) {
        // Log but don't throw - file deletion should not block project deletion
        console.error('Error deleting file:', filePath, error.message);
    }
}

/**
 * Deletes a project and its associated files
 * @param {string} id - Project ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteProject(id) {
    ensureDataExists();
    // Backup before write
    backupProjectData();

    const projects = getAllProjects();
    const project = projects.find(p => p.id === id);

    if (!project) {
        return false;
    }

    // Delete associated files (errors are logged but don't block deletion)
    if (project.images && Array.isArray(project.images)) {
        project.images.forEach(safeDeleteFile);
    }

    if (project.documents && Array.isArray(project.documents)) {
        project.documents.forEach(safeDeleteFile);
    }

    if (project.video) safeDeleteFile(project.video);
    if (project.pdf) safeDeleteFile(project.pdf);
    if (project.thumbnail) safeDeleteFile(project.thumbnail);

    // Remove from array and save
    const filteredProjects = projects.filter(p => p.id !== id);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(filteredProjects, null, 2), 'utf-8');

    return true;
}

/**
 * Updates the sort order of all projects
 * @param {Array<{id: string, order: number}>} reorderedProjects
 */
export function updateProjectOrder(reorderedProjects) {
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

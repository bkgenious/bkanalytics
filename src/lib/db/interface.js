/**
 * Database Adapter Interface
 * Defines the contract for all database adapters (JSON, PostgreSQL, etc.)
 * 
 * Implementations must export functions matching these signatures.
 */

/**
 * @typedef {Object} ProjectData
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} tool
 * @property {string} status
 * @property {string[]} tags
 * @property {string[]} images
 * @property {string} createdAt
 * @property {string} [updatedAt]
 * @property {string} [deletedAt]
 */

/**
 * Database Adapter Interface
 * @typedef {Object} DatabaseAdapter
 * @property {() => ProjectData[]} getAllProjects
 * @property {(id: string) => ProjectData | null} getProjectById
 * @property {(data: Partial<ProjectData>) => ProjectData} createProject
 * @property {(id: string, data: Partial<ProjectData>) => ProjectData | null} updateProject
 * @property {(id: string) => boolean} deleteProject
 * @property {(id: string) => boolean} restoreProject
 * @property {(id: string) => ProjectData | null} duplicateProject
 * @property {(order: {id: string, order: number}[]) => ProjectData[]} updateProjectOrder
 * @property {() => Object} getConfig
 * @property {(config: Object) => Object} updateConfig
 */

// This file is for documentation and type checking only.
// The actual adapter is selected and exported from lib/db.js
export { };

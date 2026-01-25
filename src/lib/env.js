/**
 * Environment Guardrails
 * Single source of truth for runtime environment and permissions.
 */

// 1. Detection
export function isProduction() {
    return process.env.NODE_ENV === 'production';
}

export function isCodespaces() {
    return process.env.CODESPACES === 'true';
}

export function isLocal() {
    return process.env.NODE_ENV !== 'production' && !isCodespaces();
}

/**
 * Detects if the current environment is a CMS (writable).
 * True for:
 * - Local Development
 * - GitHub Codespaces
 * - Explicit override (NEXT_PUBLIC_CMS_MODE)
 */
export function isCMS() {
    if (process.env.NEXT_PUBLIC_CMS_MODE === 'true') return true;
    if (isCodespaces()) return true;
    if (!isProduction()) return true; // Local dev is CMS
    return false;
}

// 2. Permissions
/**
 * Strict check for Write Permission.
 * Returns true ONLY if we are in a CMS environment.
 * Production Vercel deployments are Read-Only by default.
 */
export function canWrite() {
    return isCMS();
}

// 3. UI Helpers
/**
 * Returns a human-readable name for the current environment.
 */
export function getEnvironmentName() {
    if (isCodespaces()) return 'CMS (Codespaces)';
    if (isLocal()) return 'CMS (Local)';
    if (isProduction()) return 'Production (Read-Only)';
    return 'Unknown';
}

/**
 * Returns the color scheme for the environment badge.
 * @returns {'green'|'purple'|'blue'}
 */
export function getEnvironmentColor() {
    if (isCMS()) return 'green';
    return 'purple';
}

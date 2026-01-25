/**
 * Publish API Route
 * Triggers GitHub Action to commit and push changes from CMS
 */

import { isAuthenticated, validateRequestOrigin } from '@/lib/auth';
import { isCodespaces } from '@/lib/env';
import { apiResponse, apiError } from '@/lib/api-response';
import { revalidatePath } from 'next/cache';

// Runtime config
export const runtime = 'nodejs';

export async function POST(request) {
    try {
        // 1. Security Checks
        if (!validateRequestOrigin(request)) {
            return apiError('Invalid origin', 'FORBIDDEN', 403);
        }

        if (!isAuthenticated(request)) {
            return apiError('Unauthorized', 'UNAUTHORIZED', 401);
        }

        // 2. Environment Check
        if (!isCodespaces()) {
            console.warn('Publish triggered outside of Codespaces');
        }

        // 3. Trigger GitHub Action
        const GITHUB_PAT = process.env.GITHUB_PAT;
        const GITHUB_REPO = process.env.GITHUB_REPOSITORY || 'antigravity-portfolio/portfolio';

        if (!GITHUB_PAT) {
            console.error('Missing GITHUB_PAT');
            return apiError('Server misconfiguration: Missing GitHub credentials', 'CONFIG_ERROR', 503);
        }

        // 3.5. Local Revalidation (Immediate feedback for ISR)
        // This ensures the current instance serves fresh data even before the deployment finishes
        try {
            revalidatePath('/', 'layout');
        } catch (e) {
            console.warn('Revalidation failed (non-fatal):', e);
        }

        // 4. Trigger GitHub Action (repository_dispatch)
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${GITHUB_PAT}`,
                'User-Agent': 'Portfolio-CMS'
            },
            body: JSON.stringify({
                event_type: 'publish_portfolio',
                client_payload: {
                    timestamp: new Date().toISOString(),
                    user: 'admin'
                }
            })
        });

        if (response.status === 204) {
            return apiResponse({ message: 'Publish workflow triggered and local cache cleared' });
        } else {
            const errorText = await response.text();
            console.error('GitHub API Error:', errorText);
            throw new Error('Failed to trigger GitHub Action: ' + errorText);
        }

    } catch (error) {
        console.error('Publish error:', error);
        return apiError(error.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
    }
}

/**
 * Health Check API
 * Monitors system status, data integrity, and file permissions
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Mark as dynamic to prevent static optimization
export const dynamic = 'force-dynamic';

export async function GET() {
    const health = {
        server: 'online',
        timestamp: new Date().toISOString(),
        checks: {
            database: { status: 'unknown' },
            uploads: { status: 'unknown' }
        }
    };

    let status = 200;

    // Check Database integrity (Projects)
    try {
        const dbPath = path.join(process.cwd(), 'data', 'projects.json');
        if (fs.existsSync(dbPath)) {
            // Try reading to verify permissions and JSON validity
            const data = fs.readFileSync(dbPath, 'utf-8');
            JSON.parse(data);
            health.checks.database = { status: 'healthy', path: 'data/projects.json' };
        } else {
            // It's technically okay if it doesn't exist (db.js creates on first use), 
            // but for health check we want to know.
            health.checks.database = { status: 'missing', message: 'Will be created on first use' }; // Not error, just status
        }
    } catch (error) {
        health.checks.database = { status: 'error', message: error.message };
        status = 503;
    }

    // Check Config integrity
    try {
        const configPath = path.join(process.cwd(), 'data', 'config.json');
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf-8');
            JSON.parse(data);
            health.checks.config = { status: 'healthy', path: 'data/config.json' };
        } else {
            health.checks.config = { status: 'missing', message: 'Will be created on first use' };
        }
    } catch (error) {
        health.checks.config = { status: 'error', message: error.message };
        status = 503;
    }

    // Check Uploads directory & Subfolders
    try {
        const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
        const subdirs = ['images', 'videos', 'pdfs', 'documents'];

        // Ensure base exists
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
        }

        // Check write permission
        const testFile = path.join(uploadsPath, '.health-check');
        fs.writeFileSync(testFile, 'ok');
        fs.unlinkSync(testFile);

        // Ensure subdirectories exist
        subdirs.forEach(dir => {
            const dirPath = path.join(uploadsPath, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        });

        health.checks.uploads = { status: 'healthy', writable: true, subdirectories: subdirs };
    } catch (error) {
        health.checks.uploads = { status: 'error', message: error.message };
        // Don't fail 503 strictly for uploads, but it is an issue
    }

    return NextResponse.json(health, { status });
}

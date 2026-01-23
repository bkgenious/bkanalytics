/**
 * Data Seed Script
 * Populates projects.json with sample data if requested or if empty.
 * Usage: node src/scripts/seed.js [--force]
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

const SAMPLE_PROJECTS = [
    {
        id: 'sample-pbi-01',
        title: 'Retail Sales Dashboard',
        description: 'Comprehensive Power BI report analyzing global retail performance with YoY growth metrics and regional heatmaps.',
        tool: 'Power BI',
        tags: ['Retail', 'DAX', 'Sales'],
        status: 'published',
        order: 1,
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'sample-tab-01',
        title: 'Healthcare Analytics',
        description: 'Tableau visualization tracking patient wait times and departmental efficiency scores.',
        tool: 'Tableau',
        tags: ['Healthcare', 'KPIs', 'Operations'],
        status: 'published',
        order: 2,
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'sample-xls-01',
        title: 'Financial Model Pro',
        description: 'Advanced Excel financial model with VBA macros for scenario planning and risk assessment.',
        tool: 'Excel',
        tags: ['Finance', 'VBA', 'Modeling'],
        status: 'draft',
        order: 3,
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

function seed() {
    console.log('🌱 Checking seed requirements...');

    // 1. Ensure directory
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // 2. Check existing data
    let currentData = [];
    if (fs.existsSync(PROJECTS_FILE)) {
        try {
            currentData = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
        } catch (e) {
            currentData = [];
        }
    }

    const force = process.argv.includes('--force');

    if (currentData.length > 0 && !force) {
        console.log('ℹ️  Data exists. Skipping seed. Use --force to overwrite.');
        return;
    }

    console.log('📝 Seeding sample projects...');
    // If force, overwrite. Else (implied empty), write.
    // Ensure we don't duplicate if IDs match?
    // For simplicity, if we are here, we are writing.

    // If we're forcing, we might want to keep *real* projects? 
    // The requirement says "Booting with sample data", usually implies for dev/test.
    // Safest is to append if not exists, or overwrite if force.

    // Let's go with: return if data exists, unless force.

    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(SAMPLE_PROJECTS, null, 2), 'utf-8');
    console.log('✅ Seed complete. Created 3 sample projects.');
}

seed();

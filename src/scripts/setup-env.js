/**
 * Environment Setup Script
 * Ensures .env.local exists from .env.example
 * Validates required keys in .env.local
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const ENV_EXAMPLE = path.join(ROOT_DIR, '.env.example');
const ENV_LOCAL = path.join(ROOT_DIR, '.env.local');

const REQUIRED_KEYS = [
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'SESSION_SECRET'
];

function setupEnv() {
    console.log('🔧 Verifying environment configuration...');

    // 1. Create .env.local if missing
    if (!fs.existsSync(ENV_LOCAL)) {
        if (fs.existsSync(ENV_EXAMPLE)) {
            console.log('📄 .env.local missing. Creating from .env.example...');
            fs.copyFileSync(ENV_EXAMPLE, ENV_LOCAL);
            console.log('✅ Created .env.local with default values.');
            console.log('⚠️  WARNING: Using default credentials! Please update .env.local.');
        } else {
            console.error('❌ .env.example missing! Cannot verify environment.');
            process.exit(1);
        }
    }

    // 2. Validate keys
    const envContent = fs.readFileSync(ENV_LOCAL, 'utf-8');
    const missingKeys = [];

    REQUIRED_KEYS.forEach(key => {
        if (!envContent.includes(`${key}=`)) {
            missingKeys.push(key);
        }
    });

    if (missingKeys.length > 0) {
        console.warn(`⚠️  Missing keys in .env.local: ${missingKeys.join(', ')}`);
        console.warn('   Application may fail to start or authenticate.');
    } else {
        console.log('✅ Environment keys verified.');
    }
}

setupEnv();

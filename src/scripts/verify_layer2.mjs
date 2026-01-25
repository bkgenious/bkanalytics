import { getConfig, updateConfig } from '../lib/db.js';
import fs from 'fs';
import path from 'path';

// Manually fix imports for CommonJS execution context if needed, 
// OR just run with `node -r esm` or similar? 
// Actually our project is set to "type": "module" ? No, package.json doesn't say "type": "module".
// But we use ES imports in src. 
// Standard node execution will fail on ES imports without babel/transpilation.
// 
// Plan B: Create a temporary Next.js API route that triggers this on GET?
// Plan C: Use `node --input-type=module`
// Let's try Plan C with a .mjs extension.

async function verify() {
    console.log('🧪 Starting API/DB Layer Verification...');

    const configPath = path.join(process.cwd(), 'data', 'config.json');
    const backupPath = path.join(process.cwd(), 'data', 'config.bak.json');

    // 1. Read (Should seed default)
    console.log('1. Testing getConfig()...');
    const config1 = getConfig();
    if (!config1.hero) throw new Error('Failed to get default config');

    if (fs.existsSync(configPath)) {
        console.log('✅ data/config.json created successfully');
    } else {
        throw new Error('data/config.json missing after getConfig');
    }

    // 2. Write
    console.log('2. Testing updateConfig()...');
    const newHeadline = 'Verified Headline ' + Date.now();
    updateConfig({ hero: { headline: newHeadline } });

    const config2 = getConfig();
    if (config2.hero.headline === newHeadline) {
        console.log('✅ Config updated successfully');
    } else {
        throw new Error('Config update failed to persist');
    }

    // 3. Backup
    if (fs.existsSync(backupPath)) {
        console.log('✅ data/config.bak.json created successfully');
    } else {
        throw new Error('Backup file missing after update');
    }

    console.log('🎉 Layer 2 Verification Complete!');
}

verify().catch(console.error);

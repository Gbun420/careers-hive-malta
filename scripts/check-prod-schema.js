const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
    const envPath = path.resolve(__dirname, '../.env.production.local');
    if (!fs.existsSync(envPath)) return {};

    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};

    content.split('\n').forEach(line => {
        let trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const idx = trimmed.indexOf('=');
        if (idx === -1) return;

        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();

        // Remove wrapping quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }

        env[key] = val;
    });
    return env;
}

const loadedEnv = loadEnv();
const supabaseUrl = loadedEnv['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = loadedEnv['SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Config Check ---');
console.log('URL present:', !!supabaseUrl);
console.log('Key present:', !!serviceRoleKey);

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkColumn(table, column) {
    const { data, error } = await supabase.from(table).select(column).limit(1);
    if (error) {
        console.log(`❌ [${table}.${column}] Error: ${error.message}`);
        return false;
    }
    console.log(`✅ [${table}.${column}] EXISTS`);
    return true;
}

async function main() {
    console.log('--- Schema Check ---');
    await checkColumn('jobs', 'status');
    await checkColumn('jobs', 'is_active');
    await checkColumn('profiles', 'headline');
    await checkColumn('profiles', 'verification_status');

    // Check if we can select 'full_name' which should exist
    await checkColumn('profiles', 'full_name');
}

main().catch(console.error);

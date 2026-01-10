
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function checkTable() {
    // Try to find .env.production.local
    const envPath = path.join(process.cwd(), '.env.production.local');
    if (!fs.existsSync(envPath)) {
        console.error('.env.production.local not found');
        process.exit(1);
    }

    const env = fs.readFileSync(envPath, 'utf8');
    const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
    const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1];

    if (!url || !key) {
        console.error('Supabase URL or Key not found in .env.production.local');
        process.exit(1);
    }

    const supabase = createClient(url, key);

    console.log('Checking for table: applications');
    const { error } = await supabase.from('applications').select('*').limit(1);

    if (error) {
        console.error('Error checking table:', error.message);
        if (error.message.includes('relation "public.applications" does not exist') || error.message.includes('schema cache')) {
            console.log('TABLE MISSING: public.applications does not exist.');
        }
    } else {
        console.log('TABLE EXISTS: public.applications exists.');
    }
}

checkTable();

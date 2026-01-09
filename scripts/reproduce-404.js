const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manual .env.local parsing
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
} catch (e) {
    console.log('Note: .env.local not found or readable, relying on process.env');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
    console.log('--- Reproduction Script ---');

    // 1. Create a user (dummy)
    const email = `repro-${Date.now()}@example.com`;
    const { data: auth, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'password123',
        email_confirm: true
    });
    if (authError) throw authError;
    const userId = auth.user.id;
    console.log('Created User:', userId);

    // 2. Ensure Profile is PENDING (default, but explicit)
    await new Promise(r => setTimeout(r, 1000));

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: 'PENDING', role: 'employer', full_name: 'Unverified Employer' })
        .eq('id', userId);

    if (updateError) throw updateError;
    console.log('Profile set to PENDING');

    // 3. Create active Job
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
            title: 'Reproduction Job',
            description: 'Test description',
            employer_id: userId,
            status: 'active',
            is_active: true,
            location: 'Valletta',
            salary_min: 30000
        })
        .select()
        .single();

    if (jobError) throw jobError;
    console.log('Created Job:', job.id);

    // 4. Fetch via Public API (Anon) using fetch to localhost
    const apiUrl = `http://localhost:3000/api/jobs/${job.id}`;
    console.log('Fetching:', apiUrl);

    const res = await fetch(apiUrl);
    if (res.status === 200) {
        console.log('✅ Success: Job found despite PENDING profile.');
        const json = await res.json();
        console.log('Employer Name:', json.data.employer?.full_name);
    } else {
        console.log(`❌ Failed: Status ${res.status}`);
        const text = await res.text();
        console.log('Response:', text);
    }

    // Cleanup
    await supabase.from('jobs').delete().eq('id', job.id);
    await supabase.auth.admin.deleteUser(userId);
}

main().catch(e => console.error(e));

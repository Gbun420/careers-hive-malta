const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser(email, password, role) {
  console.log(`Creating ${role}: ${email}...`);
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { role: role }
  });

  if (error) {
    if (error.message.includes('already has been registered')) {
        console.log(`User ${email} already exists.`);
        // Update metadata just in case
        await supabase.auth.admin.updateUserById(
            (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email).id,
            { user_metadata: { role: role } }
        );
    } else {
        console.error(`Error creating ${email}:`, error.message);
    }
  } else {
    console.log(`Successfully created ${role}: ${email}`);
  }
}

async function main() {
  await createTestUser('jobseeker@careers.mt', 'password123', 'jobseeker');
  await createTestUser('employer@careers.mt', 'password123', 'employer');
  console.log('\nDone! You can now log in at http://localhost:3000/login');
}

main();

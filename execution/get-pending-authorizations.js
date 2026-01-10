const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZV9rZXkiOiJzYl9zZWNyZXRfTjdVTkQwVWdqS1RWSy1Vb2RrbTBIZ194U3ZFTVB2eiIsImlhdCI6MTcwNzQxODgwNCwiZXhwIjoxNzQ1NDc4ODA0fQ.zJp2P13_L5bZzI5kX8M9yD3g8c6_P6_v5Z4V1K0bXo0';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function getPendingEmployerVerifications() {
  console.log("Fetching pending employer verifications...");
  const { data, error } = await supabase
    .from('employer_verifications')
    .select('*')
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching pending employer verifications:', error.message);
    return [];
  }
  return data;
}

async function getPendingProfiles() {
  console.log("Fetching pending profiles...");
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, status') // Select relevant fields
    .eq('status', 'PENDING');

  if (error) {
    console.error('Error fetching pending profiles:', error.message);
    return [];
  }
  return data;
}

async function main() {
  const pendingEmployerVerifications = await getPendingEmployerVerifications();
  console.log('\n--- Pending Employer Verifications ---');
  if (pendingEmployerVerifications.length > 0) {
    pendingEmployerVerifications.forEach(verification => {
      console.log(`ID: ${verification.id}, Employer ID: ${verification.employer_id}, Status: ${verification.status}`);
      // Add more details as needed
    });
  } else {
    console.log('No pending employer verifications.');
  }

  const pendingProfiles = await getPendingProfiles();
  console.log('\n--- Pending User Profiles ---');
  if (pendingProfiles.length > 0) {
    pendingProfiles.forEach(profile => {
      console.log(`ID: ${profile.id}, Name: ${profile.full_name}, Email: ${profile.email}, Status: ${profile.status}`);
      // Add more details as needed
    });
  } else {
    console.log('No pending user profiles.');
  }
}

main();

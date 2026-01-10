const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// 1. Load Environment Variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  console.error('Missing required environment variables in .env.local');
  process.exit(1);
}

// 2. Initialize Clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-01-27' });

async function main() {
  console.log('🚀 Starting Payment Flow Test...');

  // 3. Create Test User (Employer)
  const email = `test-employer-${Date.now()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
    user_metadata: { role: 'employer' }
  });

  if (authError) {
    console.error('❌ Failed to create auth user:', authError);
    process.exit(1);
  }
  
  const userId = authData.user.id;
  console.log(`✅ Created Test User: ${userId} (${email})`);

  // Ensure profile exists (trigger might handle it, but let's check)
  // The 'handle_new_user' trigger creates the profile.
  // We need to wait a split second or check it.
  await new Promise(r => setTimeout(r, 1000));

  // 4. Create Test Job
  const { data: jobData, error: jobError } = await supabase
    .from('jobs')
    .insert({
      employer_id: userId,
      title: 'Test Job for Featured Payment',
      description: 'This is a test job description.',
      location: 'Malta',
      salary_range: '30k-40k',
      is_active: true
    })
    .select()
    .single();

  if (jobError) {
    console.error('❌ Failed to create job:', jobError);
    process.exit(1);
  }

  const jobId = jobData.id;
  console.log(`✅ Created Test Job: ${jobId}`);

  // 5. Simulate Stripe Checkout Session Completion
  const sessionId = `cs_test_${Date.now()}`;
  const payload = {
    id: 'evt_test_webhook',
    object: 'event',
    type: 'checkout.session.completed',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: sessionId,
        object: 'checkout.session',
        payment_status: 'paid',
        metadata: {
          employer_id: userId,
          job_id: jobId,
          type: 'featured'
        },
        payment_intent: 'pi_test_123'
      }
    }
  };

  const payloadString = JSON.stringify(payload);
  
  // 6. Generate Signature
  const header = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: STRIPE_WEBHOOK_SECRET,
  });

  console.log('📡 Sending Webhook to localhost:3000...');

  try {
    const response = await fetch('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': header
      },
      body: payloadString
    });

    const responseText = await response.text();
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`📥 Response Body: ${responseText}`);

    if (response.status !== 200) {
      console.error('❌ Webhook failed');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Network error sending webhook:', err);
    console.log('💡 Is the server running? (npm run dev)');
    process.exit(1);
  }

  // 7. Verify DB Update
  console.log('🔍 Verifying Database State...');
  
  // Check Purchase Record
  const { data: purchase } = await supabase
    .from('purchases')
    .select('*')
    .eq('stripe_checkout_session_id', sessionId)
    .single();

  if (!purchase) {
    console.error('❌ Purchase record NOT found!');
  } else {
    console.log('✅ Purchase record found:', purchase.id);
  }

  // Check Job Featured Status
  const { data: featured } = await supabase
    .from('job_featured')
    .select('*')
    .eq('job_id', jobId)
    .single();

  if (!featured) {
    console.error('❌ Job Featured record NOT found!');
    process.exit(1);
  }

  const featuredUntil = new Date(featured.featured_until);
  if (featuredUntil > new Date()) {
    console.log(`✅ Job is Featured until: ${featuredUntil.toISOString()}`);
  } else {
    console.error('❌ Job is NOT featured (date in past?)');
    process.exit(1);
  }

  // Cleanup (Optional, but good for repeatability)
  console.log('🧹 Cleaning up...');
  await supabase.auth.admin.deleteUser(userId);
  // Cascading deletes should handle profile/jobs/purchases
  
  console.log('✨ Test Passed Successfully!');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

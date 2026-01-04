const requiredVars = {
  production: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SITE_URL',
  ],
  optional: [
    'RESEND_API_KEY',
    'ALERT_DISPATCH_SECRET',
    'SEARCH_REINDEX_SECRET',
    'FEATURED_DURATION_DAYS',
  ],
};

console.log('=== ENVIRONMENT VARIABLE VALIDATION ===');

const missing = [];
const present = [];

requiredVars.production.forEach((varName) => {
  if (process.env[varName]) {
    present.push({ name: varName, status: '✅', value: '***' });
  } else {
    missing.push(varName);
    present.push({ name: varName, status: '❌', value: 'MISSING' });
  }
});

console.table(present);

if (missing.length > 0) {
  console.error('\n❌ Missing required environment variables:', missing);
  process.exit(1);
}

console.log('\n✅ All required environment variables are set');

const fs = require('fs');

const devRoutes = [
  '/api/dev/auth/login',
  '/api/dev/db/reload-schema',
  '/api/dev/db/verify-job-reports-details',
];

console.log('=== DEV ROUTE SECURITY VALIDATION ===');

devRoutes.forEach((route) => {
  const routePath = `app${route}/route.ts`;
  if (!fs.existsSync(routePath)) {
    console.log(`❌ Missing dev route: ${routePath}`);
    return;
  }

  const content = fs.readFileSync(routePath, 'utf8');
  const usesGuard = content.includes('requireDevSecret');
  const hasProdCheck = usesGuard || (content.includes('NODE_ENV') && content.includes('production') && content.includes('404'));
  const hasDevSecretCheck = usesGuard || (content.includes('x-dev-secret') && content.includes('DEV_TOOLS_SECRET'));

  console.log(`\n${route}:`);
  console.log(`  Production blocking: ${hasProdCheck ? '✅' : '❌'}`);
  console.log(`  Dev secret check: ${hasDevSecretCheck ? '✅' : '❌'}`);
});

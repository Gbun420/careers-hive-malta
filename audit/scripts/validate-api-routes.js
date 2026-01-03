const fs = require('fs');
const path = require('path');

const API_ROUTES_TO_CHECK = [
  'app/api/jobs/[id]/report/route.ts',
  'app/api/dev/auth/login/route.ts',
  'app/api/dev/db/reload-schema/route.ts',
  'app/api/dev/db/verify-job-reports-details/route.ts',
  'app/api/health/db/route.ts',
];

const runtimeRegex = /export const runtime\s*=\s*['"]nodejs['"]/;
const dynamicRegex = /export const dynamic\s*=\s*['"]force-dynamic['"]/;

console.log('=== API ROUTE RUNTIME VALIDATION ===');

let allValid = true;

API_ROUTES_TO_CHECK.forEach((route) => {
  if (!fs.existsSync(route)) {
    console.log(`❌ Missing: ${route}`);
    allValid = false;
    return;
  }

  const content = fs.readFileSync(route, 'utf8');
  const hasRuntime = runtimeRegex.test(content);
  const hasDynamic = dynamicRegex.test(content);

  console.log(`\n${route}:`);
  console.log(`  runtime: ${hasRuntime ? '✅' : '❌'}`);
  console.log(`  dynamic: ${hasDynamic ? '✅' : '❌'}`);

  if (!hasRuntime || !hasDynamic) {
    allValid = false;
  }
});

console.log(allValid ? '\n✅ All routes validated' : '\n❌ Route validation failed');
process.exit(allValid ? 0 : 1);

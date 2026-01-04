const fs = require('fs');
const path = require('path');

console.log('=== FIXING ROUTE EXPORTS FOR CLOUDFLARE ===');

// List of routes from the error log
const problematicRoutes = [
  'app/api/admin/audit/route.ts',
  'app/api/admin/reports/route.ts',
  'app/api/admin/verifications/route.ts',
  'app/api/auth/signup/route.ts',
  'app/api/dev/test/route.ts',
  'app/api/admin/reports/[id]/route.ts',
  'app/api/admin/verifications/[id]/route.ts',
  'app/api/alerts/digest/route.ts',
  'app/api/alerts/dispatch/route.ts',
  'app/api/dev/auth/login/route.ts',
  'app/api/dev/billing/create-checkout/route.ts',
  'app/api/dev/billing/simulate-webhook/route.ts',
  'app/api/dev/billing/status/route.ts',
  'app/api/dev/billing/validate-price/route.ts',
  'app/api/dev/db/reload-schema/route.ts',
  'app/api/dev/db/verify-job-reports-details/route.ts',
  'app/api/dev/featured/force/route.ts',
  'app/api/dev/stripe/create-featured-session/route.ts',
  'app/api/employer/verification/request/route.ts',
  'app/api/jobs/[id]/route.ts',
  'app/api/jobs/route.ts',
  'app/api/saved-searches/[id]/route.ts',
  'app/api/saved-searches/route.ts',
  'app/api/search/reindex/route.ts',
  'app/auth/callback/route.ts',
  'app/employer/jobs/[id]/edit/route.ts',
  'app/jobs/[id]/route.ts',
  'app/jobseeker/alerts/[id]/edit/route.ts',
  'app/jobseeker/notifications/route.ts'
];

problematicRoutes.forEach(routePath => {
  if (fs.existsSync(routePath)) {
    let content = fs.readFileSync(routePath, 'utf8');
    
    // Fix the export placement - they must come BEFORE function declarations
    const lines = content.split('\n');
    const newLines = [];
    let exportsAdded = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip the incorrectly placed exports (we'll re-add them in the correct spot)
      if (line.includes('export const runtime = "edge"') || 
          line.includes('export const dynamic = "force-dynamic"') ||
          line.includes("export const runtime = 'edge'") || 
          line.includes("export const dynamic = 'force-dynamic'")) {
        continue;
      }
      
      // Add exports at the top after imports, but before function/type declarations
      if (!exportsAdded && (line.startsWith('export async function') || line.startsWith('export function') || line.startsWith('type ') || line.startsWith('interface '))) {
        newLines.push('export const runtime = "edge";');
        newLines.push('export const dynamic = "force-dynamic";');
        newLines.push('');
        exportsAdded = true;
      }
      
      newLines.push(line);
    }
    
    // If no function/type exports found, add exports at the very top (after imports if any)
    if (!exportsAdded) {
      // Simple logic to find the end of imports
      let lastImportIndex = -1;
      for(let i=0; i<newLines.length; i++) {
        if(newLines[i].startsWith('import ')) lastImportIndex = i;
      }
      newLines.splice(lastImportIndex + 1, 0, 'export const runtime = "edge";', 'export const dynamic = "force-dynamic";', '');
    }
    
    fs.writeFileSync(routePath, newLines.join('\n'));
    console.log(`✅ Fixed: ${routePath}`);
  } else {
    console.log(`⚠️  Missing: ${routePath}`);
  }
});

console.log('\n=== ALL ROUTES FIXED ===');

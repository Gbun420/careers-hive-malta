const fs = require('fs');
const path = require('path');

// Recursively find all route.ts files in the app directory
function findRoutes(dir, results = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findRoutes(filePath, results);
    } else if (file === 'route.ts') {
      results.push(filePath);
    }
  }
  return results;
}

const routes = findRoutes(path.join(process.cwd(), 'app'));

console.log('=== UPDATING ALL ROUTES TO EDGE RUNTIME ===');

routes.forEach(routePath => {
  let content = fs.readFileSync(routePath, 'utf8');
  let updated = false;

  // Replace nodejs with edge (both double and single quotes)
  if (content.includes('runtime = "nodejs"') || content.includes("runtime = 'nodejs'")) {
    content = content.replace(/runtime = ["']nodejs["']/g, 'runtime = "edge"');
    updated = true;
  } 
  // Add runtime export if missing entirely
  else if (!content.includes('export const runtime')) {
    const lines = content.split('\n');
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('export ')) {
        insertIndex = i + 1;
      } else if (lines[i].trim().length > 0) {
        break;
      }
    }
    lines.splice(insertIndex, 0, '\nexport const runtime = "edge";\nexport const dynamic = "force-dynamic";');
    content = lines.join('\n');
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(routePath, content);
    console.log(`✅ Updated: ${routePath}`);
  } else {
    console.log(`⏩ Skipping: ${routePath} (already has runtime defined)`);
  }
});

console.log('\n=== COMPLETED ===');

const fs = require('fs');
const path = require('path');
const { exit } = require('process');

const SCAN_DIRS = ['app', 'components', 'lib'];
const ALLOWED_FILES = ['SafeExternalLink.tsx'];

// 1. Forbidden target="_blank" (except in SafeExternalLink)
const TARGET_BLANK_REGEX = /target\s*=\s*['"{]_blank['"}]/g;

// 2. Forbidden risky href fallbacks to empty string (causes about:blank or current page reload)
// Matches: href={... ?? ""} or href={... || ""} or href={... ?? ''}
const RISKY_HREF_REGEX = /href\s*=\s*\{[^}]*(\?\?|||)\s*['"]['"]\s*\}/g;

let hasError = false;

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (
      stat.isFile() &&
      /\.(tsx|jsx)$/.test(file) // Only check JSX files for these patterns
    ) {
      checkFile(fullPath, file);
    }
  }
}

function checkFile(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Rule 1: No target="_blank" outside allowed files
    if (!ALLOWED_FILES.includes(fileName) && TARGET_BLANK_REGEX.test(line)) {
      console.error(`❌ Forbidden target="_blank" found in: ${filePath}:${index + 1}`);
      console.error(`   Line: ${line.trim()}`);
      console.error(`   -> Use <SafeExternalLink> component instead.`);
      hasError = true;
    }

    // Rule 2: No risky href fallbacks to empty string
    if (RISKY_HREF_REGEX.test(line)) {
      console.error(`❌ Risky href fallback (empty string) found in: ${filePath}:${index + 1}`);
      console.error(`   Line: ${line.trim()}`);
      console.error(`   -> Use null/undefined fallback or conditional rendering.`);
      hasError = true;
    }
  });
}

console.log('=== VALIDATING LINKS (SafeExternalLink & Href Guards) ===');

SCAN_DIRS.forEach(dir => scanDirectory(dir));

if (hasError) {
  console.error('\nValidation failed! Unsafe links detected.');
  exit(1);
} else {
  console.log('✅ Links validated successfully.');
  exit(0);
}

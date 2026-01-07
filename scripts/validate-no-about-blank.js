const fs = require('fs');
const path = require('path');
const { exit } = require('process');

const SCAN_DIRS = ['app', 'components', 'lib'];
const ALLOWED_FILES = ['SafeExternalLink.tsx'];

// Regex to catch target="_blank" variations
// Matches: target="_blank", target='_blank', target={"_blank"}
const TARGET_BLANK_REGEX = /target\s*=\s*['"{]_blank['"}]/g;

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
      /\.(tsx|ts|jsx|js)$/.test(file) &&
      !ALLOWED_FILES.includes(file)
    ) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (TARGET_BLANK_REGEX.test(line)) {
      console.error(`❌ Forbidden target="_blank" found in: ${filePath}:${index + 1}`);
      console.error(`   Line: ${line.trim()}`);
      console.error(`   -> Use <SafeExternalLink> component instead.`);
      hasError = true;
    }
  });
}

console.log('=== VALIDATING NO TARGET="_BLANK" ===');

SCAN_DIRS.forEach(dir => scanDirectory(dir));

if (hasError) {
  console.error('\nValidation failed! Unsafe external links detected.');
  exit(1);
} else {
  console.log('✅ No unsafe target="_blank" usages found.');
  exit(0);
}

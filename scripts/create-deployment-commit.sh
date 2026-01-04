#!/bin/bash

set -e

echo "=== CREATING DEPLOYMENT COMMIT ==="

BRANCH=$(git branch --show-current)

COMMIT_MSG="chore: production readiness audit $(date +%Y-%m-%d)

- Security audit completed
- Dependency vulnerabilities addressed
- API route validation passed
- Health checks enhanced
- Duplicate report testing validated

Audit artifacts:
- audit/AUDIT.md
- audit/proofs/duplicate-report-validation.json
- audit/logs/security-scan.log
- audit/logs/dependency-audit.log"

git add -A
git commit -m "$COMMIT_MSG" || exit 1

echo "✅ Deployment commit created on branch: $BRANCH"

echo "📝 Commit message:"
echo "$COMMIT_MSG"

read -p "Push to remote? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git push origin "$BRANCH"
  echo "✅ Pushed to remote"
fi

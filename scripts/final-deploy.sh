#!/bin/bash

set -e

echo "=== FINAL DEPLOYMENT EXECUTION ==="

node audit/scripts/validate-api-routes.js
node audit/scripts/validate-dev-routes.js
node audit/scripts/git-validation.js

node audit/scripts/test-duplicate-report.js http://localhost:3005 "$DEV_SECRET"

./scripts/create-deployment-commit.sh

node scripts/vercel-deploy.js

PROD_URL="https://careers-hive-malta-prod.vercel.app"

node audit/scripts/smoke-tests.js "$PROD_URL"

echo "✅ Deployment completed successfully"
echo "🌐 Production URL: $PROD_URL"
echo "📊 Verification: See VERIFY.md for details"

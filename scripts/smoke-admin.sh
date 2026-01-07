#!/bin/bash

# Production Smoke Test Script for Admin Portal
# Expected to be run against the production URL or a staging URL.

TARGET_URL=${1:-"https://careers-hive-malta-prod.vercel.app"}

echo "🚀 Starting Admin Portal Smoke Test against: $TARGET_URL"

# 1. Public Pages (Expected 200/301/308)
echo "Checking public pages..."
for path in "/pricing" "/robots.txt" "/sitemap.xml"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL$path")
  if [[ "$status" =~ ^(200|301|308)$ ]]; then
    echo "✅ $path: $status"
  else
    echo "❌ $path: $status (FAILED)"
  fi
done

# 2. Admin API Protection (Logged Out)
echo "Checking Admin API protection (Anonymous)..."
status=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/api/admin/ops")
if [ "$status" == "401" ] || [ "$status" == "302" ] || [ "$status" == "307" ] || [ "$status" == "308" ]; then
  echo "✅ /api/admin/ops: $status (Access denied as expected)"
else
  echo "❌ /api/admin/ops: $status (FAILED - should be 401 or redirect)"
fi

# 3. Admin Page Protection (Logged Out)
echo "Checking Admin Page protection (Anonymous)..."
status=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/admin/dashboard")
if [ "$status" == "302" ] || [ "$status" == "307" ] || [ "$status" == "308" ] || [ "$status" == "401" ] || [ "$status" == "404" ]; then
  echo "✅ /admin/dashboard: $status (Access denied/redirected as expected)"
else
  echo "❌ /admin/dashboard: $status (FAILED - should not be 200 for anonymous)"
fi

echo "🏁 Smoke test complete."

#!/bin/bash

# Production Smoke Test Script for Admin Portal
# Expected to be run against the production URL or a staging URL.

BASE_URL=${BASE_URL:-"https://careers-hive-malta-prod.vercel.app"}

echo "🚀 Starting Admin Portal Smoke Test against: $BASE_URL"

# Helper to get final status code after redirects
final_code() {
  curl -sS -o /dev/null -w "%{http_code}" -L "$1"
}

# Helper to show redirect chain (first 20 lines)
show_chain() {
  curl -sSIL "$1" | sed -n '1,20p'
}

# 1. Public Pages (Expected FINAL 200)
echo "Checking public pages (following redirects)..."
for path in "/pricing" "/robots.txt" "/sitemap.xml"; do
  status=$(final_code "$BASE_URL$path")
  if [ "$status" == "200" ]; then
    echo "✅ $path: $status (FINAL)"
  else
    echo "❌ $path: $status (FAILED - expected 200 FINAL)"
    if [ "$path" == "/pricing" ]; then
      echo "Redirect chain for $path:"
      show_chain "$BASE_URL$path"
    fi
  fi
done

# 2. Admin API Protection (Anonymous)
echo "Checking Admin API protection (Anonymous)..."
# Now that we've excluded /api/ from middleware redirects, this should return 401 or 403 JSON error
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/ops")
if [ "$status" == "401" ] || [ "$status" == "403" ]; then
  echo "✅ /api/admin/ops: $status (JSON auth failure as expected)"
else
  echo "❌ /api/admin/ops: $status (FAILED - expected 401 or 403, got $status)"
  echo "Response headers for /api/admin/ops:"
  curl -sI "$BASE_URL/api/admin/ops" | head -n 10
fi

# 3. Admin Page Protection (Anonymous)
echo "Checking Admin Page protection (Anonymous)..."
# Pages should still redirect to /login
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/dashboard")
if [[ "$status" =~ ^(301|302|307|308)$ ]]; then
  echo "✅ /admin/dashboard: $status (Redirected as expected)"
else
  echo "❌ /admin/dashboard: $status (FAILED - expected 3xx redirect, got $status)"
fi

echo "🏁 Smoke test complete."
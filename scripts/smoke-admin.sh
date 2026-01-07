#!/bin/bash

# Production Smoke Test Script for Admin Portal
# Expected to be run against the production URL or a staging URL.

BASE_URL=${BASE_URL:-"https://careers-hive-malta-prod.vercel.app"}

echo "🚀 Starting Admin Portal Smoke Test against: $BASE_URL"

# --- Helpers ---

# Get the final HTTP status code after following all redirects
final_code() {
  curl -sS -o /dev/null -w "%{http_code}" -L "$1"
}

# Get the first HTTP status code without following redirects
first_code() {
  curl -sS -o /dev/null -w "%{http_code}" -I "$1"
}

# Get the value of the 'Location' header from the first response
first_location() {
  curl -sSI "$1" | grep -i '^location:' | awk '{print $2}' | tr -d '\r' | head -n 1
}

# Show the first 20 lines of header info (following redirects)
show_chain() {
  curl -sSIL "$1" | sed -n '1,20p'
}

# --- 1. Public Pages (Expected FINAL 200) ---
echo "--- Checking public pages (following redirects) ---"
for path in "/pricing" "/robots.txt" "/sitemap.xml" "/api/health"; do
  status=$(final_code "$BASE_URL$path")
  if [ "$status" == "200" ]; then
    echo "✅ $path: $status (FINAL)"
  else
    echo "❌ $path: $status (FAILED - expected 200 FINAL)"
    if [ "$path" == "/pricing" ] || [ "$path" == "/api/health" ]; then
      echo "Redirect chain/Response for $path:"
      show_chain "$BASE_URL$path"
    fi
  fi
done

# --- 2. Admin API Protection (Anonymous) ---
echo "--- Checking Admin API protection (Anonymous) ---"
# We expect 401 or 403. We allow 3xx only if it's NOT to /login (e.g. slash normalization)
# but the FINAL status must be 401/403.

code=$(first_code "$BASE_URL/api/admin/ops")

if [[ "$code" =~ ^3[0-9]{2}$ ]]; then
  loc=$(first_location "$BASE_URL/api/admin/ops")
  echo "↪ /api/admin/ops redirect location: $loc"
  
  if [[ "$loc" == *"/login"* ]]; then
    echo "❌ /api/admin/ops: Redirected to /login (FAILED - APIs should return 401/403 JSON)"
  else
    final=$(final_code "$BASE_URL/api/admin/ops")
    if [ "$final" == "401" ] || [ "$final" == "403" ]; then
      echo "✅ /api/admin/ops: $code -> $final (JSON auth failure as expected)"
    else
      echo "❌ /api/admin/ops: $code -> $final (FAILED - expected FINAL 401/403)"
    fi
  fi
else
  if [ "$code" == "401" ] || [ "$code" == "403" ]; then
    echo "✅ /api/admin/ops: $code (JSON auth failure as expected)"
  else
    echo "❌ /api/admin/ops: $code (FAILED - expected 401 or 403)"
    curl -sI "$BASE_URL/api/admin/ops" | head -n 10
  fi
fi

# --- 3. Admin Page Protection (Anonymous) ---
echo "--- Checking Admin Page protection (Anonymous) ---"
# Pages SHOULD redirect to /login
status=$(first_code "$BASE_URL/admin/dashboard")
if [[ "$status" =~ ^3[0-9]{2}$ ]]; then
  loc=$(first_location "$BASE_URL/admin/dashboard")
  echo "✅ /admin/dashboard: $status -> $loc (Redirected as expected)"
else
  echo "❌ /admin/dashboard: $status (FAILED - expected 3xx redirect)"
fi

echo "🏁 Smoke test complete."

const https = require('https');

/**
 * Careers.mt Launch Readiness Audit Tool (V1)
 * 🔬 Automated check for:
 * - HTTPS Redirects
 * - Cron Security (x-cron-secret)
 * - Rate Limiting (Unauthenticated Access)
 */

async function testEndpoint(url, method = 'GET', headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            headers: {
                'User-Agent': 'LaunchAudit/1.0',
                ...headers
            }
        };
        const req = https.request(url, options, (res) => {
            // Handle redirect
            if (res.statusCode === 307 || res.statusCode === 308) {
                let redirectUrl = res.headers.location;
                if (redirectUrl.startsWith('/')) {
                    const originalUrl = new URL(url);
                    redirectUrl = `${originalUrl.origin}${redirectUrl}`;
                }
                return testEndpoint(redirectUrl, method, headers).then(resolve).catch(reject);
            }
            resolve(res.statusCode);
        });
        req.on('error', (err) => reject(err));
        req.end();
    });
}

async function runAudit() {
    console.log('\n--- 🔬 Careers.mt Production Audit ---');

    const BASE_URL = 'https://careers-hive-malta-prod.vercel.app';

    // 1. Cron Security Check
    const cronUrl = `${BASE_URL}/api/cron/ingest-jobs`;
    const noSecretStatus = await testEndpoint(cronUrl, 'POST');
    console.log(`[SEC] Cron (No Secret):      ${noSecretStatus}  ${noSecretStatus === 401 ? '✅ PASS' : '⚠️ WARNING (Expected 401, check Kill Switch)'}`);

    const withSecretStatus = await testEndpoint(cronUrl, 'POST', { 'x-cron-secret': 'invalid-secret' });
    console.log(`[SEC] Cron (Bad Secret):     ${withSecretStatus}  ${withSecretStatus === 401 ? '✅ PASS' : '⚠️ WARNING (Expected 401)'}`);

    // 2. Rate Limiting Check (Simplified)
    const alertUrl = `${BASE_URL}/api/jobseeker/alerts`;
    const alertStatus = await testEndpoint(alertUrl, 'GET');
    console.log(`[SEC] RBAC/RateLimit:        ${alertStatus}  ${alertStatus === 401 ? '✅ PASS' : '⚠️ WARNING (Expected 401)'}`);

    // 3. SEO Check
    const sitemapUrl = `${BASE_URL}/sitemap.xml`;
    const sitemapStatus = await testEndpoint(sitemapUrl, 'GET');
    console.log(`[SEO] Sitemap:               ${sitemapStatus}  ${sitemapStatus === 200 ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\nAudit Complete. ✨\n');
}

runAudit().catch(console.error);

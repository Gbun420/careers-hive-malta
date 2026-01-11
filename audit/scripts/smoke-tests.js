const https = require('https');
const fs = require('fs');

class SmokeTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async runAllTests() {
    console.log(`=== PRODUCTION SMOKE TESTS (${this.baseUrl}) ===`);

    await this.testHealthEndpoints();
    await this.testPublicApiCaching();
    await this.testDevRoutesBlocked();
    await this.testAuthGates();

    this.generateReport();
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const req = https.request(
        url,
        {
          method: options.method || 'GET',
          headers: options.headers || {},
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const body = data ? JSON.parse(data) : {};
              resolve({
                status: res.statusCode,
                headers: res.headers,
                body,
              });
            } catch {
              resolve({
                status: res.statusCode,
                headers: res.headers,
                body: data,
              });
            }
          });
        }
      );

      req.on('error', reject);
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      req.end();
    });
  }

  async testHealthEndpoints() {
    console.log('1. Testing health endpoints...');

    const appHealth = await this.makeRequest('/api/health/app/');
    const dbHealth = await this.makeRequest('/api/health/db/');

    this.results.push({
      test: 'App health endpoint',
      endpoint: '/api/health/app/',
      status: appHealth.status,
      expected: 200,
      passed: appHealth.status === 200 && appHealth.body.status === 'healthy',
      headers: appHealth.headers,
      body: appHealth.body,
    });

    this.results.push({
      test: 'DB health endpoint',
      endpoint: '/api/health/db/',
      status: dbHealth.status,
      expected: 200,
      passed: dbHealth.status === 200 && dbHealth.body.status === 'healthy',
      headers: dbHealth.headers,
      body: dbHealth.body,
    });
  }

  async testPublicApiCaching() {
    console.log('2. Testing public API caching...');

    const response = await this.makeRequest('/api/jobs/');
    const cacheControl = response.headers['cache-control'] || '';

    this.results.push({
      test: 'Public API caching',
      endpoint: '/api/jobs/',
      cacheControl,
      expected: 'public, s-maxage=60',
      passed: cacheControl.includes('public') && cacheControl.includes('s-maxage=60'),
      headers: response.headers,
    });
  }

  async testDevRoutesBlocked() {
    console.log('3. Testing dev routes are blocked...');

    const response = await this.makeRequest('/api/dev/db/reload-schema/', {
      method: 'POST',
    });

    this.results.push({
      test: 'Dev routes blocked in production',
      endpoint: '/api/dev/db/reload-schema/',
      status: response.status,
      expected: 404,
      passed: response.status === 404,
      headers: response.headers,
    });
  }

  async testAuthGates() {
    console.log('4. Testing auth gates...');

    const response = await this.makeRequest('/api/billing/checkout-featured/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: { job_id: 'test' },
    });

    this.results.push({
      test: 'Auth gates require authentication',
      endpoint: '/api/billing/checkout-featured/',
      status: response.status,
      expected: 401,
      passed: response.status === 401,
      headers: response.headers,
    });
  }

  generateReport() {
    const allPassed = this.results.every((result) => result.passed);
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      allTestsPassed: allPassed,
      results: this.results,
    };

    fs.writeFileSync('audit/proofs/production-smoke-tests.json', JSON.stringify(report, null, 2));

    console.log('\n=== SMOKE TEST RESULTS ===');
    this.results.forEach((result) => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.test}`);
      console.log(`   Status: ${result.status} (expected ${result.expected})`);
      if (result.cacheControl) {
        console.log(`   Cache: ${result.cacheControl}`);
      }
    });

    console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}`);

    if (!allPassed) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const baseUrl = process.argv[2];
  if (!baseUrl) {
    console.error('Usage: node smoke-tests.js <production-url>');
    process.exit(1);
  }

  new SmokeTester(baseUrl).runAllTests();
}

module.exports = SmokeTester;

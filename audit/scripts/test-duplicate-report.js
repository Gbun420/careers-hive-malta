const fs = require('fs');

class DuplicateReportTest {
  constructor(baseUrl, devSecret) {
    this.baseUrl = baseUrl;
    this.devSecret = devSecret;
    this.testResults = [];
  }

  async runTests() {
    console.log('=== DUPLICATE REPORT VALIDATION SUITE ===');

    try {
      await this.verifySchemaDetails();
      await this.reloadSchema();
      const token = await this.getAuthToken();
      const jobId = await this.getJobId();
      await this.testDuplicateReport(jobId, token);
      this.generateReport();
    } catch (error) {
      console.error('Test failed:', error.message);
      process.exit(1);
    }
  }

  async makeRequest(url, options = {}) {
    const response = await fetch(url, {
      headers: {
        'x-dev-secret': this.devSecret,
        'content-type': 'application/json',
        ...options.headers,
      },
      method: options.method || 'GET',
      body: options.body,
    });

    const text = await response.text();
    let body = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { raw: text };
    }

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body,
      text,
    };
  }

  async verifySchemaDetails() {
    console.log('1. Verifying schema details...');
    const result = await this.makeRequest(`${this.baseUrl}/api/dev/db/verify-job-reports-details`);

    this.testResults.push({
      test: 'Schema details verification',
      status: result.status,
      expected: 200,
      passed: result.status === 200 && result.body.ok === true,
      response: result.body,
    });
  }

  async reloadSchema() {
    console.log('2. Reloading schema...');
    const result = await this.makeRequest(`${this.baseUrl}/api/dev/db/reload-schema`, {
      method: 'POST',
    });

    this.testResults.push({
      test: 'Schema reload',
      status: result.status,
      expected: 200,
      passed: result.status === 200,
      response: result.body,
    });
  }

  async getAuthToken() {
    console.log('3. Getting auth token...');
    const result = await this.makeRequest(`${this.baseUrl}/api/dev/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'devtest@local.dev',
        password: 'devtest123',
      }),
    });

    this.testResults.push({
      test: 'Authentication',
      status: result.status,
      expected: 200,
      passed: result.status === 200 && !!result.body.access_token,
      response: { has_token: !!result.body.access_token },
    });

    return result.body.access_token;
  }

  async getJobId() {
    console.log('4. Getting job ID...');
    const result = await this.makeRequest(`${this.baseUrl}/api/jobs`);

    const jobId = result.body.data?.[0]?.id;
    this.testResults.push({
      test: 'Get job ID',
      status: result.status,
      expected: 200,
      passed: result.status === 200 && !!jobId,
      response: { job_id: jobId },
    });

    if (!jobId) {
      throw new Error('No job id returned from /api/jobs');
    }

    return jobId;
  }

  async testDuplicateReport(jobId, token) {
    console.log('5. Testing duplicate report...');

    const firstReport = await this.makeRequest(`${this.baseUrl}/api/jobs/${jobId}/report`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: 'spam', details: 'test duplication' }),
    });

    const secondReport = await this.makeRequest(`${this.baseUrl}/api/jobs/${jobId}/report`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: 'spam', details: 'test duplication' }),
    });

    this.testResults.push({
      test: 'First report (should succeed)',
      status: firstReport.status,
      expected: 201,
      passed: firstReport.status === 201,
      response: firstReport.body,
    });

    this.testResults.push({
      test: 'Second report (should fail with 409)',
      status: secondReport.status,
      expected: 409,
      passed: secondReport.status === 409 && secondReport.body?.error?.code === 'DUPLICATE_REPORT',
      response: secondReport.body,
    });
  }

  generateReport() {
    const passed = this.testResults.every((result) => result.passed);
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      allTestsPassed: passed,
      results: this.testResults,
    };

    fs.writeFileSync('audit/reports/duplicate-report-validation.json', JSON.stringify(report, null, 2));

    console.log('\n=== TEST RESULTS ===');
    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.test}: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Status: ${result.status} (expected ${result.expected})`);
    });

    console.log(`\nOverall: ${passed ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}`);

    if (!passed) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3005';
  const devSecret = process.argv[3] || 'dev-secret-change-in-production';

  new DuplicateReportTest(baseUrl, devSecret).runTests();
}

module.exports = DuplicateReportTest;

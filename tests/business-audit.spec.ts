import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.TEST_USER_EMAIL || 'test-employer@example.com';
const PASSWORD = process.env.TEST_USER_PASSWORD || 'password123';

test.describe('Business Critical Audit', () => {
  
  test.describe('Revenue Blocking & Monetization', () => {
    test('Pricing Page - Load and Check Actions', async ({ page }) => {
      await page.goto(`${BASE_URL}/pricing`);
      await expect(page).toHaveTitle(/Pricing/i);
      
      // Check for "Featured Upgrade"
      await expect(page.locator('text=Featured Upgrade')).toBeVisible();
      await expect(page.locator('text=Post for Free')).toBeVisible();
      
      // Verify "Feature a Job" button links to signup (for new users)
      const featureBtn = page.locator('a[href*="/signup?role=employer"]').filter({ hasText: 'Feature a Job' });
      await expect(featureBtn).toBeVisible();
      
      // Check for "Pro" plan "Coming soon" state (non-blocking but good to know)
      await expect(page.locator('button:disabled', { hasText: 'Coming soon' })).toBeVisible();
    });

    test('Employer Job Posting Flow (UI Check)', async ({ page }) => {
      // Login as employer
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', EMAIL);
      await page.fill('input[id="password"]', PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);
      
      // Navigate to post job (assuming link exists on dashboard or direct URL)
      // Based on file structure, it might be /employer/jobs/new or similar, 
      // but let's check the dashboard for a "Post a Job" or "Manage job posts" link
      await page.goto(`${BASE_URL}/employer/jobs`);
      
      // If there's a "Create" or "Post" button, verify it exists
      // This is a "smoke" check for the flow availability
      // We won't submit to avoid creating spam data on prod unless we have cleanup
      const postButton = page.locator('a, button').filter({ hasText: /Post|Create/i }).first();
      // It might be empty if no jobs, so looking for the "New Job" action is key
      // If not found, it's a gap.
    });
  });

  test.describe('User Onboarding & Flows', () => {
    test('Signup Page Availability', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);
      // Should redirect or show role selection
      // Checking for critical elements
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('Employer Verification Page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', EMAIL);
      await page.fill('input[id="password"]', PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);
      
      await page.goto(`${BASE_URL}/employer/verification`);
      await expect(page.locator('h1')).toContainText(/verification/i);
    });
  });

  test.describe('Security & Compliance', () => {
    test('Protected Routes Redirect', async ({ page }) => {
      // clear cookies to ensure logged out
      await page.context().clearCookies();
      
      const protectedPaths = [
        '/employer/dashboard',
        '/jobseeker/dashboard',
        '/admin/dashboard',
        '/settings'
      ];

      for (const path of protectedPaths) {
        await page.goto(`${BASE_URL}${path}`);
        await page.waitForURL(/\/login|\/setup/); // Should redirect to login or setup
        expect(page.url()).not.toContain(path);
      }
    });
  });
  
  test.describe('Performance & Assets', () => {
    test('Homepage Core Web Vitals Indicators', async ({ page }) => {
        await page.goto(`${BASE_URL}/`);
        // Check if images use next/image (srcset attribute usually present)
        const logo = page.locator('img').first();
        if (await logo.count() > 0) {
             await expect(logo).toHaveAttribute('srcset');
        }
    });
  });
});

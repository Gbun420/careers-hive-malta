import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.TEST_USER_EMAIL || 'employer@careers.mt';
const PASSWORD = process.env.TEST_USER_PASSWORD || 'password123';

test.describe('Business Critical Audit', () => {
  
  test.describe('Revenue Blocking & Monetization', () => {
    test('Pricing Page - Load and Check Actions', async ({ page }) => {
      await page.goto(`${BASE_URL}/pricing`);
      // Check for main heading
      await expect(page.getByRole('heading', { name: /Accelerate your hiring/i })).toBeVisible();
      
      // Check for plan buttons/titles
      await expect(page.getByRole('heading', { name: 'Starter' })).toBeVisible();
      // Use role to disambiguate "Professional" (heading vs button)
      await expect(page.getByRole('heading', { name: 'Professional' })).toBeVisible();
      await expect(page.getByText('Go Professional')).toBeVisible();
    });

    test('Employer Job Posting Flow (UI Check)', async ({ page }) => {
      console.log('Starting Employer Job Posting Flow...');
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', EMAIL);
      await page.fill('input[id="password"]', PASSWORD);
      console.log('Clicking login...');
      await page.click('button[type="submit"]');
      
      // Wait for login to complete (button becomes "Signing in..." then disappears or redirects)
      await expect(page.locator('button:has-text("Sign In"), button:has-text("Signing in...")')).not.toBeVisible({ timeout: 15000 });
      
      console.log('Navigating to new job page...');
      await page.goto(`${BASE_URL}/employer/jobs/new`);
      // Verify we are on the job creation page
      await expect(page.locator('body')).toContainText(/Job/i);
    });
  });

  test.describe('User Onboarding & Flows', () => {
    test('Signup Page Availability', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);
      await expect(page.locator('body')).toContainText(/Create your account/i);
    });

    test('Employer Verification Page', async ({ page }) => {
      console.log('Starting Employer Verification Page test...');
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', EMAIL);
      await page.fill('input[id="password"]', PASSWORD);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('button:has-text("Sign In"), button:has-text("Signing in...")')).not.toBeVisible({ timeout: 15000 });
      
      console.log('Navigating to verification page...');
      await page.goto(`${BASE_URL}/employer/verification`);
      await expect(page.locator('body')).toContainText(/verification/i);
    });
  });

  test.describe('Security & Compliance', () => {
    test('Protected Routes Redirect', async ({ page }) => {
      // clear cookies to ensure logged out
      await page.context().clearCookies();
      
      const protectedPaths = [
        '/employer/dashboard',
        '/jobseeker/dashboard',
        '/admin/dashboard'
      ];

      for (const path of protectedPaths) {
        console.log(`Checking protected path: ${path}`);
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'commit' });
        await page.waitForURL(url => url.pathname.includes('/login') || url.pathname.includes('/setup'), { timeout: 10000 });
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

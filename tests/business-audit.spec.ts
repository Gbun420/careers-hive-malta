import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.TEST_USER_EMAIL || 'employer@careers.mt';
const PASSWORD = process.env.TEST_USER_PASSWORD || 'password123';

test.describe('Business Critical Audit', () => {
  
  test.describe('Revenue Blocking & Monetization', () => {
    test('Pricing Page - Load and Check Actions', async ({ page }) => {
      await page.goto(`${BASE_URL}/pricing`);
      // Relaxed title check or check for content
      await expect(page.locator('text=Accelerate your hiring')).toBeVisible();
      
      // Check for plans
      await expect(page.locator('text=Starter')).toBeVisible();
      await expect(page.locator('text=Professional')).toBeVisible();
      await expect(page.locator('text=Single Post')).toBeVisible();
      
      // Verify "Get Started" button links to signup (for new users)
      const featureBtn = page.locator('a[href*="/signup?role=employer"]').first();
      await expect(featureBtn).toBeVisible();
    });

    test('Employer Job Posting Flow (UI Check)', async ({ page }) => {
      // Login as employer
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', EMAIL);
      await page.fill('input[id="password"]', PASSWORD);
      await page.click('button[type="submit"]');
      
      // Might go to /dashboard or /setup if first time
      await page.waitForURL(url => url.pathname.includes('/dashboard') || url.pathname.includes('/setup'));
      
      await page.goto(`${BASE_URL}/employer/jobs/new`);
      await expect(page.locator('h1, h2')).toContainText(/post|job/i);
    });
  });

  test.describe('User Onboarding & Flows', () => {
    test('Signup Page Availability', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);
      await expect(page.locator('text=Create your account')).toBeVisible();
    });

    test('Employer Verification Page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', EMAIL);
      await page.fill('input[id="password"]', PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(url => url.pathname.includes('/dashboard') || url.pathname.includes('/setup'));
      
      await page.goto(`${BASE_URL}/employer/verification`);
      await expect(page.locator('h1, h2')).toContainText(/verification/i);
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

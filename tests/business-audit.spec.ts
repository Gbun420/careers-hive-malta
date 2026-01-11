import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.TEST_USER_EMAIL || 'employer@careers.mt';
const PASSWORD = process.env.TEST_USER_PASSWORD || 'password123';

test.describe('Business Audit Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto(BASE_URL)
  })

  test('Pricing Page - Load and Check Actions', async ({ page }) => {
    // Navigate to pricing page
    await page.goto(`${BASE_URL}/pricing`)
    
    // Check for main heading
    await expect(page.getByRole('heading', { name: /Accelerate your hiring/i })).toBeVisible();
    
    // Check for pricing cards
    await expect(page.getByRole('heading', { name: 'Starter' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Professional' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Single Post' })).toBeVisible()
  })

  test('Employer Job Posting Flow', async ({ page }) => {
    // Login as test employer
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[id="email"]', EMAIL);
    await page.fill('input[id="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for login to complete (button disappears or redirects)
    await expect(page.locator('button:has-text("Sign In"), button:has-text("Signing in...")')).not.toBeVisible({ timeout: 15000 });
    
    // Navigate to job posting
    await page.goto(`${BASE_URL}/employer/jobs/new`)
    
    // Fill job form
    await page.getByLabel(/Job Title/i).fill('Test Software Engineer')
    await page.getByLabel(/Location/i).fill('Msida, Malta')
    await page.getByLabel(/Salary Min/i).fill('40000')
    await page.getByLabel(/Salary Max/i).fill('60000')
    // For description, we might need to target the editor or textarea
    const description = page.locator('textarea[id="description"], .ProseMirror, [contenteditable="true"]').first();
    if (await description.isVisible()) {
        await description.fill('Exciting opportunity for a software engineer in Malta. This is a comprehensive test description for the platform.');
    }
    
    // Submit job
    const postBtn = page.locator('button:has-text("Post Job"), button:has-text("Create Job")').first();
    await expect(postBtn).toBeVisible();
  })

  test('Employer Verification Page', async ({ page }) => {
    // Login and navigate to verification
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[id="email"]', EMAIL);
    await page.fill('input[id="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('button:has-text("Sign In"), button:has-text("Signing in...")')).not.toBeVisible({ timeout: 15000 });
    
    await page.goto(`${BASE_URL}/employer/verification`)
    
    // Check verification status or page content
    await expect(page.locator('body')).toContainText(/verification/i);
  })
})
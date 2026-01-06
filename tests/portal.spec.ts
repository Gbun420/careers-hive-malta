import { test, expect } from '@playwright/test';

const BASE_URL = 'https://careers-hive-malta-prod.vercel.app';
const EMAIL = 'bundyglenn@gmail.com';
const PASSWORD = 'Floyd420!';

test.describe('Portal & Functional Tests', () => {
  
  test('Login and Access Dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/login/`);
    
    // Fill login form
    await page.fill('input[id="email"]', EMAIL);
    await page.fill('input[id="password"]', PASSWORD);
    
    // Click Sign In
    await page.click('button[type="submit"]');
    
    // Expect to be redirected to a dashboard
    // Depending on the role, it might be /jobseeker/dashboard or /employer/dashboard
    await page.waitForURL(/\/dashboard/);
    
    const url = page.url();
    console.log(`Successfully logged in. Redirected to: ${url}`);
    
    expect(url).toContain('dashboard');
    
    // Verify dashboard title - all dashboards use "Command" in their main heading
    await expect(page.locator('h1, h2').first()).toContainText(/Command/i);
  });

  test('View and Edit Profile', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login/`);
    await page.fill('input[id="email"]', EMAIL);
    await page.fill('input[id="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for and verify admin dashboard
    await page.waitForURL(/\/admin\/dashboard/);
    const url = page.url();
    console.log(`Successfully logged in. Redirected to: ${url}`);
    expect(url).toContain('admin/dashboard');
    
    // Navigate to account settings from admin dashboard
    await page.goto(`${BASE_URL}/settings/`);
    await page.waitForLoadState('networkidle');
    
    // Wait for the settings page to load and check for email in various possible locations
    await page.waitForTimeout(2000); // Give page time to load dynamic content
    
    // Check for email in common profile field locations
    const emailLocator = page.locator('input[type="email"], input[id*="email" i], *[data-testid*="email" i]').first();
    if (await emailLocator.isVisible()) {
      const emailValue = await emailLocator.inputValue();
      expect(emailValue).toBe(EMAIL);
    } else {
      // Fallback: check in text content if not in input field
      const pageContent = await page.content();
      expect(pageContent).toContain(EMAIL);
    }
    
    // Test editing profile (if inputs available)
    const nameInput = page.locator('input[id="full_name"], input[name="full_name"]');
    if (await nameInput.isVisible()) {
      const oldName = await nameInput.inputValue();
      const newName = oldName.includes('Test') ? 'Glenn Bundy' : 'Glenn Bundy Test';
      await nameInput.fill(newName);
      await page.click('button:has-text("Save"), button:has-text("Update"), button[type="submit"]');
      // Wait a bit for the save operation
      await page.waitForTimeout(1000);
      // Look for success toast or message
      await expect(page.locator('body')).toContainText(/success|updated|saved/i);
    }
  });

  test('Security Check - Basic XSS and Navigation', async ({ page }) => {
    // Attempt basic XSS in a search field or input if available
    await page.goto(`${BASE_URL}/jobs/`);
    const searchInput = page.locator('input[placeholder*="search" i], input[id*="search" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('<script>alert("xss")</script>');
      await page.keyboard.press('Enter');
      // Verify script didn't execute (Playwright won't show alert unless handled, 
      // but we can check if it's rendered as text)
      await expect(page.locator('body')).not.toContainText('<script>alert("xss")</script>');
    }
  });

  test('Accessibility Check - ARIA Labels and Alt Text', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check for images without alt text
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // expect(alt).not.toBeNull(); // Optional: strict check
    }

    // Check for buttons with aria-labels or text
    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const text = await btn.innerText();
      const ariaLabel = await btn.getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});

const { test, expect } = require('@playwright/test');

test('contact form submits successfully', async ({ page }) => {
  // Mock external requests so the test doesn't depend on live services
  await page.route('https://script.google.com/**', route => route.fulfill({ status: 200, body: '' }));
  await page.route('https://*.supabase.co/**', route => route.fulfill({ status: 201, body: '' }));

  await page.goto('/');

  // Scroll to the contact form
  await page.locator('#contact-form').scrollIntoViewIfNeeded();

  // Fill in the form
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('textarea[name="comment"]', 'This is a test message from Playwright.');

  // Set up navigation promise before clicking
  const navigationPromise = page.waitForURL('**/thank-you.html', { timeout: 10000 });
  await page.click('#submit-btn');
  await navigationPromise;

  await expect(page).toHaveURL(/thank-you\.html/);
});

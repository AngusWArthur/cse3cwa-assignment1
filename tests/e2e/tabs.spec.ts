import { test, expect } from '@playwright/test';

test.describe('Tabs builder', () => {
  // Start each test with a clean slate for localStorage
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      try {
        // Clear all keys to avoid hitting MAX_TABS or stale content
        localStorage.clear();
      } catch {}
    });
  });

  test('add a tab and preview it', async ({ page }) => {
    await page.goto('/tabs');

    // Ensure the page and builder are ready (hydrate complete)
    await expect(page.getByRole('heading', { level: 1, name: 'Tabs' })).toBeVisible();
    const builder = page.locator('section[aria-labelledby="builder"]');
    await expect(builder).toBeVisible();

    // Fill the "New Tab" form
    await page.getByLabel('New Tab Title').fill('Playwright Tab');
    await page.getByLabel(/New Tab Content/i).fill('Hello from Playwright');

    // Click "Add Tab"
    await page.getByRole('button', { name: 'Add Tab' }).click();

    // Scope to the Live Preview area and wait for the new tab to appear
    const preview = page.locator('section[aria-labelledby="rendered"]');
    await expect(preview).toBeVisible();

    const newTab = preview.getByRole('tab', { name: 'Playwright Tab' });

    // Wait for the tab header to be rendered (state update after click)
    await expect(newTab).toBeVisible();

    // Click the tab (even though it should already be active)
    await newTab.click();

    // Assert the active tabpanel contains our text
    await expect(preview.getByRole('tabpanel')).toContainText('Hello from Playwright', { timeout: 10_000 });

    // Optional: confirm the generated export contains our data
    const codeBlock = page.locator('section[aria-labelledby="code"] pre code');
    await expect(codeBlock).toContainText('Playwright Tab');
    await expect(codeBlock).toContainText('Hello from Playwright');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('header, nav links render', async ({ page }) => {
    await page.goto('/');

    // Wait for the header to be hydrated and the site title link to appear
    const siteTitle = page.locator('header .site-title'); // matches your Header.jsx/globals.css
    await expect(siteTitle).toBeVisible();

    await expect(siteTitle).toHaveText(/CSE3CWA|Assignment/i);

    // Nav links (left drawer is hidden; but header has a center link and there are page links)
    // Assert the main links are present somewhere on the page
    await expect(page.getByRole('link', { name: 'Tabs' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Escape Room' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();

    // Breadcrumb shouldn’t be on the home page
    await expect(page.getByRole('navigation', { name: /Breadcrumb/i })).toHaveCount(0);
  });
});

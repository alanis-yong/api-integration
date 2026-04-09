import { test, expect } from '@playwright/test';

test.describe('Store Dark Mode Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByLabel('Switch to dark mode');
    await toggle.click();
  });

  test("dark mode item card looks correct", async ({page}) => {
    const card = page.getByTestId('item-card-test').first();
    await expect(card).toHaveScreenshot('item-card-dark.png');
  })
})
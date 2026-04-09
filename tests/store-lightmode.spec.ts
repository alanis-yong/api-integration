import { test, expect } from '@playwright/test';

test.describe('Store Light Mode Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test("light mode item card looks correct", async ({page}) => {
    const card = page.getByTestId('item-card-test').first();
    await expect(card).toHaveScreenshot('item-card-light.png');
  })
})
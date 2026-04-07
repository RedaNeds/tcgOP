import { expect, test } from '@playwright/test';

test('authenticated user can log out and is redirected to login', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_logout_${seed}`;
  const password = 'password123';

  // Register
  await page.goto('/register');
  await page.getByLabel(/username/i).fill(username);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  await page.getByRole('button', { name: /register/i }).click();
  await expect(page).toHaveURL(/\/login\?registered=true/);

  // Login
  await page.getByLabel(/username/i).fill(username);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/(app)?$/);

  // Go to app and log out
  await page.goto('/app');
  await expect(page).toHaveURL(/\/app/);

  // Click the Sign Out button (form submit button with title="Sign Out")
  await page.locator('button[title="Sign Out"]').click();

  // Should redirect to /login
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('user can register, login, and open dashboard add-asset modal', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_${seed}`;
  const password = 'password123';

  await page.goto('/register');
  await page.getByLabel(/username/i).fill(username);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  await page.getByRole('button', { name: /register/i }).click();

  await expect(page).toHaveURL(/\/login\?registered=true/);

  await page.getByLabel(/username/i).fill(username);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/(app)?$/);
  await page.goto('/app');
  await expect(page).toHaveURL(/\/app/);
  await expect(page.getByText(/command center/i).first()).toBeVisible();

  await page.getByRole('button', { name: /add your first card/i }).click();
  await expect(page.getByRole('heading', { name: /locate asset/i })).toBeVisible();

  await page.getByRole('button', { name: /close search/i }).click();
  await expect(page.getByRole('heading', { name: /locate asset/i })).not.toBeVisible();
});

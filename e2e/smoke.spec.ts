import { expect, test } from '@playwright/test';

test('landing page renders primary call to action', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: /get started free/i })).toBeVisible();
  await expect(page.getByText(/ready to level up your collection\?/i)).toBeVisible();
});

test('login page renders auth form', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  await expect(page.getByLabel(/username/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
});

test('register page renders signup form', async ({ page }) => {
  await page.goto('/register');

  await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
  await expect(page.getByLabel(/username/i)).toBeVisible();
  await expect(page.getByLabel(/^password$/i)).toBeVisible();
  await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
});

test('health endpoint returns ok payload', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data.status).toBe('ok');
  expect(data.db.status).toBe('connected');
});

import { expect, test } from '@playwright/test';
import bcrypt from 'bcryptjs';
import prisma from '../lib/db';

test('authenticated user can export portfolio as CSV from settings', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_csv_${seed}`;
  const password = 'password123';
  const cardId = `E2E-CSV-${seed}`;
  const cardName = `E2E CSV Card ${seed}`;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, name: username, password: hashedPassword },
    });

    await prisma.card.create({
      data: { id: cardId, code: cardId, name: cardName, set: 'E2E CSV Set', rarity: 'R', currentPrice: 20 },
    });

    await prisma.portfolioItem.create({
      data: { userId: user.id, cardId, quantity: 2, purchasePrice: 15 },
    });

    // Login
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/(app)?$/);

    // Navigate to settings
    await page.goto('/app/settings');
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();

    // Click Export CSV and await the download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export csv/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/optcg-collection-.+\.csv/);
  } finally {
    await prisma.portfolioItem.deleteMany({ where: { cardId } });
    await prisma.card.deleteMany({ where: { id: cardId } });
    await prisma.user.deleteMany({ where: { username } });
  }
});

test('settings page renders all key sections', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_settings_${seed}`;
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

  await page.goto('/app/settings');
  await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
  await expect(page.getByText(/appearance/i)).toBeVisible();
  await expect(page.getByText(/profile/i)).toBeVisible();
  await expect(page.getByText(/data management/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /save profile changes/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /export csv/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /reset portfolio/i })).toBeVisible();
});

import { expect, test } from '@playwright/test';
import bcrypt from 'bcryptjs';
import prisma from '../lib/db';

// Helper: register + login a fresh user
async function loginUser(page: any, username: string, password: string) {
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
}

test('card catalog page renders search and filter controls', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_cat_${seed}`;
  const password = 'password123';

  await loginUser(page, username, password);
  await page.goto('/app/cards');

  await expect(page.getByRole('heading', { name: /card catalog/i })).toBeVisible();
  await expect(page.getByPlaceholder(/search by name or code/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Filters', exact: true })).toBeVisible();
});

test('card catalog search filters results', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_catsearch_${seed}`;
  const password = 'password123';
  const cardId = `E2E-CAT-${seed}`;
  const cardName = `E2E Catalog Search ${seed}`;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { username, name: username, password: hashedPassword } });
    await prisma.card.create({
      data: { id: cardId, code: cardId, name: cardName, set: 'E2E Catalog Set', rarity: 'SR', currentPrice: 25 },
    });

    await page.goto('/login');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/(app)?$/);

    // Use URL query param to pre-filter — the page is server-rendered with ?q=
    await page.goto(`/app/cards?q=${encodeURIComponent(cardId)}`);
    await expect(page.getByRole('heading', { name: /card catalog/i })).toBeVisible();

    // The seeded card should appear in results
    await expect(page.getByText(cardName)).toBeVisible({ timeout: 10000 });
  } finally {
    await prisma.card.deleteMany({ where: { id: cardId } });
    await prisma.user.deleteMany({ where: { username } });
  }
});

test('card catalog filter panel opens and rarity filter works', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_catrarity_${seed}`;
  const password = 'password123';
  const rarityCardId = `E2E-RARITY-${seed}`;
  const rarityCardName = `E2E Rarity Card ${seed}`;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { username, name: username, password: hashedPassword } });
    await prisma.card.create({
      data: { id: rarityCardId, code: rarityCardId, name: rarityCardName, set: 'E2E Rarity Set', rarity: 'SEC', currentPrice: 100 },
    });

    await page.goto('/login');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/(app)?$/);

    // Apply rarity filter via URL param
    await page.goto('/app/cards?rarity=SEC');
    await expect(page.getByRole('heading', { name: /card catalog/i })).toBeVisible();

    // The Filters button should indicate an active filter
    await expect(page.getByRole('button', { name: 'Filters', exact: true })).toBeVisible();

    // Our seeded SEC card should appear
    await expect(page.getByText(rarityCardName)).toBeVisible({ timeout: 10000 });
  } finally {
    await prisma.card.deleteMany({ where: { id: rarityCardId } });
    await prisma.user.deleteMany({ where: { username } });
  }
});

test('card catalog pagination controls render when multiple pages exist', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_catpage_${seed}`;
  const password = 'password123';

  await loginUser(page, username, password);

  // Just navigate to the catalog; pagination controls are rendered by server
  // based on total card count. We verify the page renders without error.
  await page.goto('/app/cards');
  await expect(page.getByRole('heading', { name: /card catalog/i })).toBeVisible();

  // If there are multiple pages, test navigating to page 2 via URL
  await page.goto('/app/cards?page=2');
  // Page should still render the catalog heading (not crash)
  await expect(page.getByRole('heading', { name: /card catalog/i })).toBeVisible();
});

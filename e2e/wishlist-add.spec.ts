import { expect, test } from '@playwright/test';
import bcrypt from 'bcryptjs';
import prisma from '../lib/db';

test('authenticated user can add a card to the wishlist via card search', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_wl_add_${seed}`;
  const password = 'password123';
  const cardId = `E2E-WLADD-${seed}`;
  const cardCode = cardId;
  const cardName = `E2E WL Add Card ${seed}`;

  try {
    const hashedPassword = await bcrypt.hash(password, 1);
    await prisma.user.create({
      data: { username, name: username, password: hashedPassword },
    });

    // Seed a card so the search can find it
    await prisma.card.create({
      data: { id: cardId, code: cardCode, name: cardName, set: 'E2E WL Set', rarity: 'R', currentPrice: 30 },
    });

    // Login
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/(app)?$/);

    await page.goto('/app/wishlist');
    await expect(page.getByRole('heading', { name: /^wishlist$/i }).first()).toBeVisible();

    // Click "Add Item" to open card search
    await page.getByRole('button', { name: /add item/i }).click();

    // Search for the seeded card by code
    await page.getByPlaceholder(/search card/i).fill(cardCode);

    // Wait for result and click it
    await expect(page.getByText(cardName).first()).toBeVisible({ timeout: 10000 });
    await page.getByText(cardName).first().click();

    // AddWishlistModal should open
    await expect(page.getByRole('heading', { name: /target alert/i })).toBeVisible();

    // Click "Set Target Alert"
    await page.getByRole('button', { name: /set target alert/i }).click();

    // Modal closes, card appears in wishlist
    await expect(page.getByRole('heading', { name: /target alert/i })).not.toBeVisible();
    await expect(page.getByText(cardCode).first()).toBeVisible();
  } finally {
    await prisma.wishlistItem.deleteMany({ where: { card: { id: cardId } } });
    await prisma.card.deleteMany({ where: { id: cardId } });
    await prisma.user.deleteMany({ where: { username } });
  }
});

test('authenticated user can edit the target price of a wishlist item', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_wl_edit_${seed}`;
  const password = 'password123';
  const cardId = `E2E-WLEDIT-${seed}`;
  const cardName = `E2E WL Edit Card ${seed}`;

  try {
    const hashedPassword = await bcrypt.hash(password, 1);
    const user = await prisma.user.create({
      data: { username, name: username, password: hashedPassword },
    });

    await prisma.card.create({
      data: { id: cardId, code: cardId, name: cardName, set: 'E2E WL Edit Set', rarity: 'SR', currentPrice: 50 },
    });

    await prisma.wishlistItem.create({
      data: { userId: user.id, cardId, targetPrice: 45, notes: 'e2e edit target' },
    });

    // Login
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/(app)?$/);

    await page.goto('/app/wishlist');
    await expect(page.getByRole('heading', { name: /^wishlist$/i }).first()).toBeVisible();
    await expect(page.getByText(cardId).first()).toBeVisible();

    // In grid mode, clicking the card opens the EditWishlistItemModal directly
    await expect(page.getByText(cardName).first()).toBeVisible({ timeout: 10000 });
    await page.getByText(cardName).first().click();
    await expect(page.getByRole('heading', { name: /edit wishlist item/i })).toBeVisible({ timeout: 10000 });

    // Update target price
    const priceInput = page.locator('input[type="number"]').first();
    await priceInput.fill('35');

    await page.getByRole('button', { name: /^save$/i }).click();

    // Modal should close
    await expect(page.getByRole('heading', { name: /edit wishlist item/i })).not.toBeVisible();
  } finally {
    await prisma.wishlistItem.deleteMany({ where: { cardId } });
    await prisma.card.deleteMany({ where: { id: cardId } });
    await prisma.user.deleteMany({ where: { username } });
  }
});

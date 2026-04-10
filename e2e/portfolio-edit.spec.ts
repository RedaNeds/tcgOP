import { expect, test } from '@playwright/test';
import bcrypt from 'bcryptjs';
import prisma from '../lib/db';

test('authenticated user can edit a portfolio item via the edit modal', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_edit_${seed}`;
  const password = 'password123';
  const cardId = `E2E-EDIT-${seed}`;
  const cardName = `E2E Edit Card ${seed}`;

  try {
    const hashedPassword = await bcrypt.hash(password, 1);
    const user = await prisma.user.create({
      data: { username, name: username, password: hashedPassword },
    });

    await prisma.card.create({
      data: { id: cardId, code: cardId, name: cardName, set: 'E2E Edit Set', rarity: 'R', currentPrice: 15 },
    });

    await prisma.portfolioItem.create({
      data: { userId: user.id, cardId, quantity: 1, purchasePrice: 10 },
    });

    // Login
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/(app)?$/);

    await page.goto('/app/portfolio');

    // In grid mode, clicking the card name opens the edit modal directly
    await expect(page.getByText(cardName).first()).toBeVisible({ timeout: 15000 });
    await page.getByText(cardName).first().click();
    await expect(page.getByRole('heading', { name: /^Edit Asset$/i })).toBeVisible({ timeout: 15000 });

    // Update quantity — label text is "Quantity" but has no htmlFor, so find input after label
    const quantityInput = page.locator('input[type="number"]').first();
    await quantityInput.fill('3');

    await page.getByRole('button', { name: /save changes/i }).click();

    // Modal should close - use specific heading to avoid matching card name containing 'Edit'
    await expect(page.getByRole('heading', { name: /^Edit Asset$/i })).not.toBeVisible({ timeout: 15000 });
  } finally {
    await prisma.portfolioItem.deleteMany({ where: { cardId } });
    await prisma.card.deleteMany({ where: { id: cardId } });
    await prisma.user.deleteMany({ where: { username } });
  }
});

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
    const hashedPassword = await bcrypt.hash(password, 10);
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

    // Go to portfolio — switch to table view
    await page.goto('/app/portfolio');
    await page.locator('button').filter({ has: page.locator('svg') }).nth(1).click(); // list/table view toggle

    // Click the card name cell to open the edit modal (avoid clicking inputs in the row)
    await page.locator('tr').filter({ hasText: cardName }).locator('td').nth(1).click({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: /edit/i })).toBeVisible();

    // Update quantity — label text is "Quantity" but has no htmlFor, so find input after label
    const quantityInput = page.locator('input[type="number"]').first();
    await quantityInput.fill('3');

    await page.getByRole('button', { name: /save changes/i }).click();

    // Modal should close
    await expect(page.getByRole('heading', { name: /edit/i })).not.toBeVisible();
  } finally {
    await prisma.portfolioItem.deleteMany({ where: { cardId } });
    await prisma.card.deleteMany({ where: { id: cardId } });
    await prisma.user.deleteMany({ where: { username } });
  }
});

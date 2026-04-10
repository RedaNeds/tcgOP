import { expect, test } from '@playwright/test';
import bcrypt from 'bcryptjs';
import prisma from '../lib/db';

test('authenticated user can bulk-delete selected portfolio items', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_bulk_${seed}`;
  const password = 'password123';
  const cardAId = `E2E-BULK-A-${seed}`;
  const cardBId = `E2E-BULK-B-${seed}`;
  const cardAName = `E2E Bulk Alpha ${seed}`;
  const cardBName = `E2E Bulk Beta ${seed}`;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, name: username, password: hashedPassword },
    });

    await prisma.card.createMany({
      data: [
        { id: cardAId, code: cardAId, name: cardAName, set: 'E2E Bulk Set', rarity: 'R', currentPrice: 10 },
        { id: cardBId, code: cardBId, name: cardBName, set: 'E2E Bulk Set', rarity: 'R', currentPrice: 12 },
      ],
    });

    await prisma.portfolioItem.createMany({
      data: [
        { userId: user.id, cardId: cardAId, quantity: 1, purchasePrice: 8 },
        { userId: user.id, cardId: cardBId, quantity: 1, purchasePrice: 9 },
      ],
    });

    // Login
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/(app)?$/);

    await page.goto('/app/portfolio');

    // Click each Select checkbox — handleToggleSelect adds each item independently
    await page.locator(`button[aria-label="Select ${cardAName}"]`).click();
    await page.locator(`button[aria-label="Select ${cardBName}"]`).click();

    // Bulk delete toolbar should appear
    await expect(page.getByText(/2 Assets Selected/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /bulk delete/i }).click();

    // Confirm modal — default label is "Confirm"
    await page.getByRole('button', { name: /^confirm$/i }).click();

    // Portfolio should now be empty
    await expect(page.getByText(/begin your voyage/i)).toBeVisible();
  } finally {
    await prisma.portfolioItem.deleteMany({ where: { cardId: { in: [cardAId, cardBId] } } });
    await prisma.card.deleteMany({ where: { id: { in: [cardAId, cardBId] } } });
    await prisma.user.deleteMany({ where: { username } });
  }
});

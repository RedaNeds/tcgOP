import { expect, test } from '@playwright/test';
import prisma from '../lib/db';

test('authenticated user can filter dashboard arsenal items', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_filter_${seed}`;
  const password = 'password123';
  const firstCardId = `E2E-FILTER-A-${seed}`;
  const secondCardId = `E2E-FILTER-B-${seed}`;
  const firstCardName = `E2E Filter Alpha ${seed}`;
  const secondCardName = `E2E Filter Beta ${seed}`;
  let userId: string | null = null;

  try {
    await page.goto('/register');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByLabel(/confirm password/i).fill(password);
    await page.getByRole('button', { name: /register/i }).click();
    await expect(page).toHaveURL(/\/login\?registered=true/);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user?.id) throw new Error('Failed to create/register e2e user');
    userId = user.id;

    await prisma.card.create({
      data: {
        id: firstCardId,
        code: firstCardId,
        name: firstCardName,
        set: 'E2E Set A',
        rarity: 'SR',
        currentPrice: 30,
      },
    });

    await prisma.card.create({
      data: {
        id: secondCardId,
        code: secondCardId,
        name: secondCardName,
        set: 'E2E Set B',
        rarity: 'SR',
        currentPrice: 30,
      },
    });

    await prisma.portfolioItem.create({
      data: {
        userId,
        cardId: firstCardId,
        quantity: 1,
        purchasePrice: 25,
      },
    });

    await prisma.portfolioItem.create({
      data: {
        userId,
        cardId: secondCardId,
        quantity: 1,
        purchasePrice: 25,
      },
    });

    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/(app)?$/);

    await page.goto('/app');
    await expect(page.getByRole('heading', { name: /your arsenal/i }).first()).toBeVisible();
    const removeButtons = page.locator('button[aria-label^="Remove "]');
    await expect(removeButtons).toHaveCount(2);

    await page.getByPlaceholder(/search arsenal by name, code or set/i).fill(firstCardId);
    await expect(removeButtons).toHaveCount(1);

    await page.getByPlaceholder(/search arsenal by name, code or set/i).fill('');
    await page.locator('select').nth(1).selectOption('E2E Set B');
    await expect(removeButtons).toHaveCount(1);

  } finally {
    await prisma.portfolioItem.deleteMany({ where: { cardId: { in: [firstCardId, secondCardId] } } });
    await prisma.card.deleteMany({ where: { id: { in: [firstCardId, secondCardId] } } });
    if (userId) {
      await prisma.account.deleteMany({ where: { userId } });
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    } else {
      await prisma.user.deleteMany({ where: { username } });
    }
  }
});

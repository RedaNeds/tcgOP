import { expect, test } from '@playwright/test';
import bcrypt from 'bcryptjs';
import prisma from '../lib/db';

test('authenticated user can see and remove a seeded dashboard asset', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_asset_${seed}`;
  const password = 'password123';
  const cardId = `E2E-${seed}`;
  const cardName = `E2E Card ${seed}`;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        name: username,
        password: hashedPassword,
      },
    });

    await prisma.card.create({
      data: {
        id: cardId,
        code: cardId,
        name: cardName,
        set: 'E2E Test Set',
        rarity: 'SR',
        currentPrice: 25,
      },
    });

    await prisma.portfolioItem.create({
      data: {
        userId: user.id,
        cardId,
        quantity: 2,
        purchasePrice: 20,
      },
    });

    await page.goto('/login');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/(app)?$/);
    await page.goto('/app');
    await expect(page.getByRole('heading', { name: /your arsenal/i }).first()).toBeVisible();

    const removeButton = page.getByRole('button', { name: `Remove ${cardName} from portfolio` });
    await expect(removeButton).toHaveCount(1);
    await removeButton.click({ force: true });
    await page.getByRole('button', { name: /confirm removal/i }).click({ timeout: 10000 });

    await expect(page.getByText(/begin your voyage/i)).toBeVisible({ timeout: 15000 });
    await expect(removeButton).toHaveCount(0);
  } finally {
    await prisma.portfolioItem.deleteMany({ where: { cardId } });
    await prisma.card.deleteMany({ where: { id: cardId } });
    await prisma.user.deleteMany({ where: { username } });
  }
});

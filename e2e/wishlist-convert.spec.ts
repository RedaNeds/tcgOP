import { expect, test } from '@playwright/test';
import prisma from '../lib/db';

test('authenticated user can convert wishlist item into portfolio', async ({ page }) => {
  const seed = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `e2e_wishlist_${seed}`;
  const password = 'password123';
  const cardId = `E2E-WL-${seed}`;
  const cardCode = cardId;
  const cardName = `E2E Wishlist Card ${seed}`;
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
        id: cardId,
        code: cardCode,
        name: cardName,
        set: 'E2E Wishlist Set',
        rarity: 'R',
        currentPrice: 42,
      },
    });

    await prisma.wishlistItem.create({
      data: {
        userId,
        cardId,
        targetPrice: 45,
        notes: 'e2e wishlist convert',
      },
    });

    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/(app)?$/);

    await page.goto('/app/wishlist');
    await expect(page.getByRole('heading', { name: /^wishlist$/i }).first()).toBeVisible();
    await expect(page.getByText(cardCode).first()).toBeVisible();

    await page.locator('button[title="I acquired this card"]').first().click();
    await expect(page.getByRole('heading', { name: /acquired!/i })).toBeVisible();
    await page.getByRole('button', { name: /confirm purchase/i }).click();

    await expect(page.getByRole('heading', { name: /acquired!/i })).toHaveCount(0);
    await expect(page.getByText(cardCode)).toHaveCount(0);

    await page.goto('/app/portfolio');
    await expect(page.getByText(cardCode).first()).toBeVisible();
  } finally {
    await prisma.portfolioItem.deleteMany({ where: { cardId } });
    await prisma.wishlistItem.deleteMany({ where: { cardId } });
    await prisma.card.deleteMany({ where: { id: cardId } });
    if (userId) {
      await prisma.account.deleteMany({ where: { userId } });
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    } else {
      await prisma.user.deleteMany({ where: { username } });
    }
  }
});

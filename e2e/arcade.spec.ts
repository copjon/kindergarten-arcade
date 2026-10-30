import { expect, test, type Locator, type Page } from '@playwright/test';

// Fail any test whose page throws an uncaught error.
let pageErrors: Error[] = [];
test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err));
});
test.afterEach(() => {
  expect(pageErrors, 'uncaught errors in the page').toEqual([]);
});

async function openGame(page: Page, title: string) {
  await page.goto('./');
  await page.getByText(title, { exact: true }).click();
  await expect(page.getByRole('heading', { level: 2 })).toContainText(title);
}

/**
 * The target is only spoken aloud, so tests find it by elimination: tap each
 * option until one registers as a hit. Invaders never stop moving, so clicks
 * skip Playwright's "wait until stable" check.
 */
async function hitByElimination(options: Locator, hitSelector: string): Promise<number> {
  const count = await options.count();
  for (let i = 0; i < count; i++) {
    await options.nth(i).click({ force: true });
    if (await options.page().locator(hitSelector).count()) return i;
    await options.page().waitForTimeout(500);
  }
  throw new Error('No option registered as the correct answer');
}

test('serves the build that was just deployed', async ({ page }) => {
  const expected = process.env.EXPECTED_SHA;
  test.skip(!expected, 'EXPECTED_SHA not set (local run)');
  await page.goto('./');
  await expect(page.locator('meta[name="build-sha"]')).toHaveAttribute('content', expected!);
});

test('home screen lists the games and the parent dashboard', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle('Kindergarten Arcade');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Kindergarten\s*Arcade/i);
  await expect(page.getByText('Word Invaders', { exact: true })).toBeVisible();
  await expect(page.getByText('Alpha Blast', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /For Parents/ })).toBeVisible();
});

test.describe('Word Invaders', () => {
  test('blasting the spoken word scores and advances the wave', async ({ page }) => {
    await openGame(page, 'Word Invaders');
    await expect(page.getByText('Wave 1 of 18')).toBeVisible();

    const invaders = page.locator('.invader');
    await expect(invaders).toHaveCount(4);

    const misses = await hitByElimination(invaders, '.invader.hit');
    if (misses > 0) await expect(page.locator('.bubble')).not.toHaveText('Blast the word you hear! 👂');
    await expect(page.locator('.quiz-score')).not.toHaveText('⭐ 0 pts');
    await expect(page.getByText('Wave 2 of 18')).toBeVisible({ timeout: 10_000 });
  });

  test('Learn Words shows the word in a highlighted sentence', async ({ page }) => {
    await openGame(page, 'Word Invaders');
    await page.getByRole('button', { name: /Learn Words/ }).click();
    await page.getByRole('button', { name: 'Word the', exact: true }).click();
    await expect(page.locator('.learn-word')).toHaveText('the');
    await expect(page.locator('.learn-sentence mark')).toHaveText('the');
    await expect(page.getByRole('button', { name: /Spell it/ })).toBeVisible();
  });
});

test.describe('Alpha Blast', () => {
  test('a correct match scores and moves to the next letter', async ({ page }) => {
    await openGame(page, 'Alpha Blast');
    await expect(page.getByText('Letter 1 of 25')).toBeVisible();

    const options = page.locator('.opt');
    await expect(options).toHaveCount(4);
    await hitByElimination(options, '.opt.right');

    await expect(page.locator('.quiz-score')).not.toHaveText('⭐ 0 pts');
    await expect(page.getByText('Letter 2 of 25')).toBeVisible({ timeout: 15_000 });
  });

  test('Explore Letters lets you browse the alphabet', async ({ page }) => {
    await openGame(page, 'Alpha Blast');
    await page.getByRole('button', { name: /Explore Letters/ }).click();
    await page.getByRole('button', { name: 'Letter m', exact: true }).click();
    await expect(page.locator('.spotlight-letter')).toHaveText('Mm');
  });
});

test('parent dashboard shows saved practice history per game', async ({ page }) => {
  await page.addInitScript(() => {
    const entry = (gameId: string, gameTitle: string, missed: string[]) => ({
      id: `${gameId}-seed`,
      gameId,
      gameTitle,
      timestamp: Date.now(),
      score: 100,
      maxScore: 200,
      total: 10,
      gotFirstTry: 8,
      avgTimeMs: 3000,
      missedLetters: missed,
      slowLetters: [],
    });
    localStorage.setItem(
      'phonics.history.v1',
      JSON.stringify([entry('sight-words', 'Word Invaders', ['the']), entry('letter-sounds', 'Alpha Blast', ['q'])]),
    );
  });
  await page.goto('./');
  await page.getByRole('button', { name: /For Parents/ }).click();
  await expect(page.getByRole('heading', { name: 'Words to work on' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Letters to work on' })).toBeVisible();
  await expect(page.locator('.history-row')).toHaveCount(2);
});

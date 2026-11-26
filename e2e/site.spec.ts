import { expect, test, type Page } from '@playwright/test';

const WIDTHS = [320, 375, 768, 1024, 1440];

/** 測試不依賴外部網路：Google Fonts 一律回空的 CSS */
async function stubFonts(page: Page): Promise<void> {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
  );
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('requestfailed', (req) => errors.push(`request failed: ${req.url()}`));
  return errors;
}

test.beforeEach(async ({ page }) => {
  await stubFonts(page);
});

test('loads without errors and shows every section', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  for (const selector of ['#top', '#highlights', '#gifts', '#stats', '.partners', '.cta', '#contact']) {
    await expect(page.locator(selector)).toBeVisible();
  }
  await expect(page.locator('[data-countdown]')).toContainText(/聖誕|Christmas/);
  expect(errors).toEqual([]);
});

test('nav links scroll to their sections', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('#nav-menu').getByRole('link', { name: '數字', exact: true }).click();
  await expect(page).toHaveURL(/#stats$/);
  await expect(page.locator('#stats')).toBeInViewport();
});

test('clicking an ornament opens its highlight card', async ({ page }) => {
  await page.goto('/');
  await page.locator('a.ornament[href="#hl-ai"]').click();
  await expect(page.locator('#hl-ai')).toHaveAttribute('open', '');
  await expect(page.locator('#hl-ai')).toBeInViewport();
});

test('keyboard users can open a card from the tree', async ({ page }) => {
  await page.goto('/');
  await page.locator('a.ornament[href="#hl-global"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#hl-global')).toHaveAttribute('open', '');
});

test('snow toggle turns off and is remembered', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('.snow-toggle');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('canvas.snow')).toBeHidden();
  await page.reload();
  await expect(page.locator('.snow-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('mobile menu opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const menu = page.locator('#nav-menu');
  await expect(menu).toBeHidden();
  await page.locator('.nav__toggle').click();
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: '成果', exact: true }).click();
  await expect(menu).toBeHidden();
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('keeps snow off and shows final numbers', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.snow-toggle')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('canvas.snow')).toBeHidden();
    await expect(page.locator('[data-countup]')).toHaveText(['95%', '50+', '100+']);
  });
});

for (const width of WIDTHS) {
  test(`no horizontal scroll at ${width}px with every card open`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await page.evaluate(() => {
      document.querySelectorAll('details').forEach((d) => {
        d.open = true;
      });
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

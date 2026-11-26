import { expect, test } from '@playwright/test';

const SHOTS = [
  { name: 'mobile', width: 375 },
  { name: 'desktop', width: 1440 },
] as const;

for (const shot of SHOTS) {
  test(`review screenshot: ${shot.name}`, async ({ page }) => {
    await page.setViewportSize({ width: shot.width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#stats').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-countup]').first()).toHaveText('95%');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/review-${shot.name}.png`, fullPage: true });
  });
}

import { expect, test } from '@playwright/test';

const SHOTS = [
  { name: 'mobile', width: 375 },
  { name: 'desktop', width: 1440 },
] as const;

/** 整頁截圖時畫面外的區塊會被 content-visibility 跳過，截圖前強制全部繪製 */
const RENDER_ALL = '.highlights, .gifts, .stats, .partners, .cta, .site-footer { content-visibility: visible !important; }';

test.use({ bypassCSP: true });

for (const shot of SHOTS) {
  test(`review screenshot: ${shot.name}`, async ({ page }) => {
    await page.setViewportSize({ width: shot.width, height: 900 });
    await page.goto('/');
    // 字型 CSS 由 main.ts 執行時才掛上，先等它載入，再等標題用到的字重
    await page.waitForFunction(() => document.querySelector<HTMLLinkElement>('link[data-fonts]')?.sheet != null);
    await page.evaluate(async () => {
      await document.fonts.load('900 48px "Noto Sans TC"', '虎科資管');
      await document.fonts.load('700 48px "Noto Sans TC"', 'Merry Christmas');
      await document.fonts.ready;
    });
    await page.locator('#stats').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-countup]').first()).toHaveText('95%');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.addStyleTag({ content: RENDER_ALL });
    await page.screenshot({ path: `test-results/review-${shot.name}.png`, fullPage: true });
  });
}

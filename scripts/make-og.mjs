import { chromium } from '@playwright/test';
import { preview } from 'vite';

const OUT = 'public/og.png';
const PORT = 4184;

const server = await preview({ preview: { port: PORT, strictPort: true } });
try {
  // 倒數天數會過時，預覽圖改用 HTML 裡沒有 JS 時的固定文字
  const html = await (await fetch(`http://localhost:${PORT}/`)).text();
  const countdownFallback = html.match(/data-countdown[^>]*>([^<]+)</)?.[1];
  if (!countdownFallback) {
    throw new Error('Countdown fallback text not found in index.html');
  }
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      reducedMotion: 'reduce',
      bypassCSP: true,
    });
    await page.goto(`http://localhost:${PORT}/`);
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: '.snow-toggle, .skip-link { display: none !important; }' });
    await page.locator('[data-countdown]').evaluate((el, text) => {
      el.textContent = text;
    }, countdownFallback);
    await page.screenshot({ path: OUT });
    console.log(`Saved ${OUT}`);
  } finally {
    await browser.close();
  }
} finally {
  await server.close();
}

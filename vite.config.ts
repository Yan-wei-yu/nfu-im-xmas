import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { site } from './src/data/site.ts';
import { fillPlaceholders, renderPage } from './src/render/page.ts';
import vercel from './vercel.json' with { type: 'json' };

function renderSite(): Plugin {
  return {
    name: 'render-site',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => fillPlaceholders(html, renderPage(site)),
    },
  };
}

/** vite preview 套用和 Vercel 相同的安全標頭，E2E 才抓得到 CSP 違規 */
const securityHeaders = Object.fromEntries(
  (vercel.headers.find((rule) => rule.source === '/(.*)')?.headers ?? []).map((h) => [h.key, h.value]),
);

export default defineConfig({
  plugins: [renderSite()],
  preview: { headers: securityHeaders },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});

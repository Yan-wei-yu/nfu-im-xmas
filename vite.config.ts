import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { site } from './src/data/site';
import { fillPlaceholders, renderPage } from './src/render/page';

function renderSite(): Plugin {
  return {
    name: 'render-site',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => fillPlaceholders(html, renderPage(site)),
    },
  };
}

export default defineConfig({
  plugins: [renderSite()],
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

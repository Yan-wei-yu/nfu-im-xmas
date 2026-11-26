import type { Site } from '../data/types.ts';
import { escapeHtml } from './html.ts';

/** canonical 與分享圖必須是完整的 https 網址，頁內錨點或 mailto 都不行 */
function requireHttps(url: string): string {
  if (!url.startsWith('https://')) {
    throw new Error(`Canonical and share URLs must use https: ${url}`);
  }
  return url;
}

export function renderHead(meta: Site['meta']): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(requireHttps(meta.url));
  const image = escapeHtml(requireHttps(meta.ogImage));
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="theme-color" content="${escapeHtml(meta.themeColor)}" />`,
    `<link rel="canonical" href="${url}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="zh_TW" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta name="twitter:card" content="summary_large_image" />',
  ].join('\n    ');
}

import type { Link } from '../data/types';

const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

const SAFE_URL = /^(https:\/\/|mailto:|#)/;

/** 只允許 https:、mailto: 與頁內錨點，其他網址在 build 時就丟錯 */
export function safeUrl(url: string): string {
  if (!SAFE_URL.test(url)) {
    throw new Error(`Unsafe URL: ${url}`);
  }
  return url;
}

export interface LinkOptions {
  readonly className?: string;
  readonly arrow?: boolean;
}

export function renderLink(link: Link, options: LinkOptions = {}): string {
  const href = escapeHtml(safeUrl(link.url));
  const external = link.url.startsWith('https://');
  const cls = options.className ? ` class="${escapeHtml(options.className)}"` : '';
  const target = external ? ' target="_blank" rel="noopener noreferrer"' : '';
  const arrow = options.arrow ? '<span aria-hidden="true"> ↗</span>' : '';
  const note = external ? '<span class="sr-only">（另開新分頁）</span>' : '';
  return `<a${cls} href="${href}"${target}>${escapeHtml(link.label)}${arrow}${note}</a>`;
}

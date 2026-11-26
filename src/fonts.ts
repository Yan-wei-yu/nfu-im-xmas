export const FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Noto+Sans+TC:wght@400;700;900&display=swap';

/**
 * 字型 CSS 很大（Noto Sans TC 三種字重），寫在 <head> 會擋住第一次繪製。
 * 改由 main.ts 在第一次繪製之後才掛上：文字先用系統字型，字型到了再換上（display=swap）。
 * CSP 不允許 inline onload，所以不用 media="print" 的寫法。
 */
export function loadFonts(doc: Document): HTMLLinkElement {
  const existing = doc.head.querySelector<HTMLLinkElement>('link[data-fonts]');
  if (existing) {
    return existing;
  }
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONT_STYLESHEET;
  link.dataset.fonts = '';
  doc.head.append(link);
  return link;
}

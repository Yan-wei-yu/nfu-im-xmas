const HIGHLIGHT_PREFIX = '#hl-';
const LIT_MS = 1600;

/** 打開網址 hash 指到的特色卡片，並讓它亮一下 */
export function openHighlight(win: Window, doc: Document, hash: string): HTMLDetailsElement | null {
  if (!hash.startsWith(HIGHLIGHT_PREFIX)) {
    return null;
  }
  const target = doc.getElementById(hash.slice(1));
  if (!target || target.tagName !== 'DETAILS') {
    return null;
  }
  const card = target as HTMLDetailsElement;
  card.open = true;
  card.classList.add('is-lit');
  win.setTimeout(() => card.classList.remove('is-lit'), LIT_MS);
  return card;
}

export function initTree(win: Window, doc: Document): void {
  doc.querySelectorAll<SVGAElement>('a.ornament').forEach((ornament) => {
    ornament.addEventListener('click', () => {
      openHighlight(win, doc, ornament.getAttribute('href') ?? '');
    });
  });
  win.addEventListener('hashchange', () => {
    openHighlight(win, doc, win.location.hash);
  });
  openHighlight(win, doc, win.location.hash);
}

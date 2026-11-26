const HIGHLIGHT_PREFIX = '#hl-';
const LIT_MS = 1600;
/** 每張卡片目前的熄燈計時器；重複打開時重新起算，不會被前一次提早熄掉 */
const litTimers = new WeakMap<Element, number>();

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
  const previous = litTimers.get(card);
  if (previous !== undefined) {
    win.clearTimeout(previous);
  }
  const timer = win.setTimeout(() => {
    card.classList.remove('is-lit');
    litTimers.delete(card);
  }, LIT_MS);
  litTimers.set(card, timer);
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

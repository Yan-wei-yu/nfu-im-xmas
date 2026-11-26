export type ChristmasState =
  | { readonly kind: 'before'; readonly days: number }
  | { readonly kind: 'day' }
  | { readonly kind: 'after' };

/** 台灣固定 UTC+8，沒有日光節約 */
const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function christmasState(now: Date): ChristmasState {
  const taipei = new Date(now.getTime() + TAIPEI_OFFSET_MS);
  const year = taipei.getUTCFullYear();
  const month = taipei.getUTCMonth() + 1;
  const day = taipei.getUTCDate();
  if (month === 12 && day === 25) {
    return { kind: 'day' };
  }
  if (month === 12 && day > 25) {
    return { kind: 'after' };
  }
  const today = Date.UTC(year, month - 1, day);
  const christmas = Date.UTC(year, 11, 25);
  return { kind: 'before', days: Math.round((christmas - today) / DAY_MS) };
}

export function countdownText(state: ChristmasState): string {
  switch (state.kind) {
    case 'before':
      return `距離聖誕節還有 ${state.days} 天`;
    case 'day':
      return 'Merry Christmas！今天就是聖誕節';
    case 'after':
      return 'Merry Christmas & Happy New Year';
  }
}

export function initCountdown(root: ParentNode, now: Date = new Date()): void {
  const text = countdownText(christmasState(now));
  root.querySelectorAll<HTMLElement>('[data-countdown]').forEach((el) => {
    el.textContent = text;
  });
}

import { prefersReducedMotion } from './prefs.ts';

export const COUNTUP_MS = 1200;
const VISIBLE_THRESHOLD = 0.4;

interface Counter {
  readonly figure: Element;
  readonly el: HTMLElement;
  readonly target: number;
  readonly suffix: string;
  readonly ring: SVGCircleElement | null;
}

export function easeOutCubic(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return 1 - (1 - clamped) ** 3;
}

export function valueAt(target: number, elapsedMs: number, durationMs: number = COUNTUP_MS): number {
  return Math.round(target * easeOutCubic(elapsedMs / durationMs));
}

function show(counter: Counter, value: number): void {
  counter.el.textContent = `${value}${counter.suffix}`;
  if (counter.ring) {
    const circumference = Number(counter.ring.getAttribute('stroke-dasharray'));
    counter.ring.setAttribute('stroke-dashoffset', String(circumference * (1 - value / 100)));
  }
}

function animate(win: Window, counter: Counter): void {
  let start: number | null = null;
  const step = (time: number): void => {
    start ??= time;
    const elapsed = time - start;
    show(counter, valueAt(counter.target, elapsed));
    if (elapsed < COUNTUP_MS) {
      win.requestAnimationFrame(step);
    }
  };
  win.requestAnimationFrame(step);
}

function toCounter(el: HTMLElement): Counter {
  const figure = el.closest('.stat') ?? el;
  return {
    figure,
    el,
    target: Number(el.dataset.countup),
    suffix: el.dataset.suffix ?? '',
    ring: figure.querySelector<SVGCircleElement>('circle[data-ring]'),
  };
}

/** HTML 裡已經是終值；只有能播動畫時才先歸零，捲到時再跳回終值 */
export function initCountUp(win: Window, doc: Document): void {
  if (prefersReducedMotion(win) || typeof win.IntersectionObserver !== 'function') {
    return;
  }
  const counters = [...doc.querySelectorAll<HTMLElement>('[data-countup]')].map(toCounter);
  const observer = new win.IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const counter = counters.find((c) => c.figure === entry.target);
        if (!entry.isIntersecting || !counter) {
          continue;
        }
        observer.unobserve(entry.target);
        animate(win, counter);
      }
    },
    { threshold: VISIBLE_THRESHOLD },
  );
  for (const counter of counters) {
    show(counter, 0);
    observer.observe(counter.figure);
  }
}

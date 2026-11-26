// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COUNTUP_MS, easeOutCubic, initCountUp, valueAt } from '../src/countup.ts';
import { site } from '../src/data/site.ts';
import { renderStats } from '../src/render/sections.ts';

class FakeObserver {
  static last: FakeObserver | null = null;
  observed: Element[] = [];
  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeObserver.last = this;
  }
  observe(el: Element): void {
    this.observed.push(el);
  }
  unobserve(el: Element): void {
    this.observed = this.observed.filter((e) => e !== el);
  }
  disconnect(): void {
    this.observed = [];
  }
  reveal(el: Element): void {
    const entry = { isIntersecting: true, target: el } as IntersectionObserverEntry;
    this.callback([entry], this as unknown as IntersectionObserver);
  }
}

let frames: FrameRequestCallback[] = [];
const values = (): string[] =>
  [...document.querySelectorAll('[data-countup]')].map((el) => el.textContent ?? '');

beforeEach(() => {
  document.body.innerHTML = renderStats(site.statsSection, site.stats);
  frames = [];
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames.push(cb);
    return frames.length;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, 'IntersectionObserver');
  Reflect.deleteProperty(window, 'matchMedia');
  FakeObserver.last = null;
});

describe('easing', () => {
  it('eases out and clamps to [0, 1]', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(0.5)).toBe(0.875);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });

  it('rounds intermediate values', () => {
    expect(valueAt(95, 0)).toBe(0);
    expect(valueAt(95, COUNTUP_MS / 2)).toBe(83);
    expect(valueAt(95, COUNTUP_MS)).toBe(95);
  });
});

describe('initCountUp', () => {
  it('leaves final numbers alone when motion is reduced', () => {
    window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    initCountUp(window, document);
    expect(values()).toEqual(['95%', '50+', '100+']);
  });

  it('leaves final numbers alone without IntersectionObserver', () => {
    initCountUp(window, document);
    expect(values()).toEqual(['95%', '50+', '100+']);
  });

  it('counts up from zero once a stat scrolls into view', () => {
    window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
    initCountUp(window, document);
    expect(values()).toEqual(['0%', '0+', '0+']);

    const ringFigure = document.querySelector('.stat--ring')!;
    FakeObserver.last!.reveal(ringFigure);
    expect(FakeObserver.last!.observed).not.toContain(ringFigure);
    frames.shift()?.(1000);
    frames.shift()?.(1000 + COUNTUP_MS / 2);
    expect(values()[0]).toBe('83%');
    frames.shift()?.(1000 + COUNTUP_MS);
    expect(values()).toEqual(['95%', '0+', '0+']);
    expect(frames).toHaveLength(0);

    const offset = Number(document.querySelector('circle[data-ring]')!.getAttribute('stroke-dashoffset'));
    expect(offset).toBeCloseTo(16.34, 1);
  });

  it('ignores observer entries that are not intersecting', () => {
    window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
    initCountUp(window, document);
    const figure = document.querySelector('.stat--count')!;
    const entry = { isIntersecting: false, target: figure } as IntersectionObserverEntry;
    (FakeObserver.last as unknown as { callback: IntersectionObserverCallback }).callback(
      [entry],
      FakeObserver.last as unknown as IntersectionObserver,
    );
    expect(frames).toHaveLength(0);
  });
});

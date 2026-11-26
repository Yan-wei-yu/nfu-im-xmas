// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_MS, afterFirstPaint, afterLoad } from '../src/schedule.ts';

function setReadyState(state: DocumentReadyState): void {
  Object.defineProperty(document, 'readyState', { configurable: true, get: () => state });
}

class FakePaintObserver {
  static supportedEntryTypes = ['paint'];
  static last: FakePaintObserver | null = null;
  disconnected = false;
  constructor(private readonly callback: (list: { getEntriesByName(name: string): unknown[] }) => void) {
    FakePaintObserver.last = this;
  }
  observe(): void {}
  disconnect(): void {
    this.disconnected = true;
  }
  paint(name: string): void {
    this.callback({ getEntriesByName: (n) => (n === name ? [{ name }] : []) });
  }
}

afterEach(() => {
  Reflect.deleteProperty(document, 'readyState');
  Reflect.deleteProperty(window, 'PerformanceObserver');
  FakePaintObserver.last = null;
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('afterLoad', () => {
  it('runs right away when the page has already loaded', () => {
    setReadyState('complete');
    const fn = vi.fn();
    afterLoad(window, fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('waits for the load event while the page is still loading', () => {
    setReadyState('interactive');
    const fn = vi.fn();
    afterLoad(window, fn);
    expect(fn).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('load'));
    window.dispatchEvent(new Event('load'));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('afterFirstPaint', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setReadyState('complete');
  });

  it('runs once the browser reports the first contentful paint', () => {
    window.PerformanceObserver = FakePaintObserver as unknown as typeof PerformanceObserver;
    const fn = vi.fn();
    afterFirstPaint(window, fn);
    expect(fn).not.toHaveBeenCalled();

    FakePaintObserver.last!.paint('first-paint');
    expect(fn).not.toHaveBeenCalled();

    FakePaintObserver.last!.paint('first-contentful-paint');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(FakePaintObserver.last!.disconnected).toBe(true);

    vi.advanceTimersByTime(FALLBACK_MS);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('runs right away when the first contentful paint already happened', () => {
    vi.spyOn(performance, 'getEntriesByName').mockReturnValue([{} as PerformanceEntry]);
    const fn = vi.fn();
    afterFirstPaint(window, fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('falls back to a delay after load when paint timing is unavailable', () => {
    const fn = vi.fn();
    afterFirstPaint(window, fn);
    vi.advanceTimersByTime(FALLBACK_MS - 1);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

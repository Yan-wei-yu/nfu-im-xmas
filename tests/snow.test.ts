// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initSnow } from '../src/snow/snow.ts';

let frames: FrameRequestCallback[] = [];
const originalHeight = window.innerHeight;

function fakeContext(): CanvasRenderingContext2D {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    fillStyle: '',
    font: '',
  } as unknown as CanvasRenderingContext2D;
}

function setHidden(hidden: boolean): void {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  document.dispatchEvent(new Event('visibilitychange'));
}

const toggle = (): HTMLButtonElement => document.querySelector<HTMLButtonElement>('.snow-toggle')!;
const canvas = (): HTMLCanvasElement => document.querySelector<HTMLCanvasElement>('canvas.snow')!;

beforeEach(() => {
  document.body.innerHTML =
    '<canvas class="snow"></canvas><button class="snow-toggle" type="button" aria-pressed="true" hidden>飄雪</button>';
  localStorage.clear();
  frames = [];
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => fakeContext() as never);
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames.push(cb);
    return frames.length;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  setHidden(false);
  Reflect.deleteProperty(window, 'matchMedia');
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalHeight });
});

describe('initSnow', () => {
  it('does nothing without a canvas or a 2d context', () => {
    document.body.innerHTML = '';
    expect(initSnow({ win: window, doc: document })).toBeNull();
    document.body.innerHTML = '<canvas class="snow"></canvas><button class="snow-toggle" hidden></button>';
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    expect(initSnow({ win: window, doc: document })).toBeNull();
    expect(toggle().hidden).toBe(true);
  });

  it('starts snowing and shows the toggle', () => {
    const snow = initSnow({ win: window, doc: document, random: () => 0.5 })!;
    expect(snow.isRunning()).toBe(true);
    expect(toggle().hidden).toBe(false);
    expect(toggle().getAttribute('aria-pressed')).toBe('true');
    frames.shift()?.(16);
    frames.shift()?.(32);
    expect(snow.isRunning()).toBe(true);
  });

  it('turns off, hides the canvas and remembers the choice', () => {
    const snow = initSnow({ win: window, doc: document })!;
    toggle().click();
    expect(snow.isRunning()).toBe(false);
    expect(canvas().hidden).toBe(true);
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
    expect(localStorage.getItem('xmas-snow')).toBe('off');
    toggle().click();
    expect(snow.isRunning()).toBe(true);
    expect(localStorage.getItem('xmas-snow')).toBe('on');
  });

  it('pauses while the tab is hidden', () => {
    const snow = initSnow({ win: window, doc: document })!;
    setHidden(true);
    expect(snow.isRunning()).toBe(false);
    setHidden(false);
    expect(snow.isRunning()).toBe(true);
  });

  it('stays off by default when reduced motion is requested', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    const snow = initSnow({ win: window, doc: document })!;
    expect(snow.isRunning()).toBe(false);
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps snow off under reduced motion even if it was turned on before', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    localStorage.setItem('xmas-snow', 'on');
    const snow = initSnow({ win: window, doc: document })!;
    expect(snow.isRunning()).toBe(false);
    toggle().click();
    expect(snow.isRunning()).toBe(true);
  });

  it('stops when reduced motion is switched on mid-visit without saving it as a choice', () => {
    let onChange: ((event: { matches: boolean }) => void) | undefined;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => {
        onChange = listener;
      },
    });
    const snow = initSnow({ win: window, doc: document })!;
    expect(snow.isRunning()).toBe(true);
    onChange?.({ matches: true });
    expect(snow.isRunning()).toBe(false);
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
    expect(localStorage.getItem('xmas-snow')).toBeNull();
  });

  it('keeps the same flakes when only the window height changes', () => {
    const random = vi.fn(() => 0.5);
    initSnow({ win: window, doc: document, random });
    const calls = random.mock.calls.length;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 770 });
    window.dispatchEvent(new Event('resize'));
    expect(random.mock.calls.length).toBe(calls);
    expect(canvas().height).toBe(770);
  });

  it('draws both dots and 0/1 glyphs', () => {
    const ctx = fakeContext();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(ctx as never);
    let i = 0;
    const alternating = (): number => (i++ % 2 === 0 ? 0.1 : 0.9);
    initSnow({ win: window, doc: document, random: alternating });
    frames.shift()?.(16);
    expect(ctx.fillText).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
  });
});

import { SNOW_KEY, browserStore, prefersReducedMotion, readToggle, writeToggle } from '../prefs';
import { createFlake, flakeCount, flakeX, stepFlake, type Flake, type Random } from './model';

export interface SnowDeps {
  readonly win: Window;
  readonly doc: Document;
  readonly random?: Random;
}

export interface SnowController {
  readonly isRunning: () => boolean;
  readonly setEnabled: (enabled: boolean) => void;
}

const MAX_DPR = 2;
const MAX_STEP_MS = 100;
/** 與 --color-text 相同的 RGB */
const SNOW_RGB = '232, 238, 249';
const GLYPH_FONT = '"JetBrains Mono", ui-monospace, monospace';

export function initSnow({ win, doc, random = Math.random }: SnowDeps): SnowController | null {
  const canvas = doc.querySelector<HTMLCanvasElement>('canvas.snow');
  const toggle = doc.querySelector<HTMLButtonElement>('.snow-toggle');
  const ctx = canvas?.getContext('2d') ?? null;
  if (!canvas || !toggle || !ctx) {
    return null;
  }

  const store = browserStore(win);
  let enabled = readToggle(store, SNOW_KEY, !prefersReducedMotion(win));
  let flakes: Flake[] = [];
  let width = 0;
  let height = 0;
  let frame: number | null = null;
  let last = 0;

  const resize = (): void => {
    const dpr = Math.min(win.devicePixelRatio || 1, MAX_DPR);
    width = win.innerWidth;
    height = win.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    flakes = Array.from({ length: flakeCount(width, height) }, () => createFlake(random, width, height));
  };

  const draw = (): void => {
    ctx.clearRect(0, 0, width, height);
    for (const f of flakes) {
      ctx.fillStyle = `rgba(${SNOW_RGB}, ${f.alpha})`;
      if (f.glyph) {
        ctx.font = `${f.size}px ${GLYPH_FONT}`;
        ctx.fillText(f.glyph, flakeX(f), f.y);
      } else {
        ctx.beginPath();
        ctx.arc(flakeX(f), f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const tick = (time: number): void => {
    const dt = last ? Math.min(time - last, MAX_STEP_MS) : 16;
    last = time;
    flakes = flakes.map((f) => stepFlake(f, dt, height));
    draw();
    frame = win.requestAnimationFrame(tick);
  };

  const start = (): void => {
    if (frame !== null || !enabled || doc.hidden) {
      return;
    }
    last = 0;
    frame = win.requestAnimationFrame(tick);
  };

  const stop = (): void => {
    if (frame !== null) {
      win.cancelAnimationFrame(frame);
      frame = null;
    }
  };

  const render = (): void => {
    canvas.hidden = !enabled;
    toggle.setAttribute('aria-pressed', String(enabled));
    if (enabled) {
      start();
    } else {
      stop();
      ctx.clearRect(0, 0, width, height);
    }
  };

  const setEnabled = (next: boolean): void => {
    enabled = next;
    writeToggle(store, SNOW_KEY, next);
    render();
  };

  toggle.hidden = false;
  toggle.addEventListener('click', () => setEnabled(!enabled));
  doc.addEventListener('visibilitychange', () => (doc.hidden ? stop() : start()));
  win.addEventListener('resize', resize);
  resize();
  render();

  return { isRunning: () => frame !== null, setEnabled };
}

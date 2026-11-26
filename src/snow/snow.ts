import { SNOW_KEY, browserStore, readToggle, reducedMotionQuery, writeToggle } from '../prefs.ts';
import { flakeX, resizeFlakes, stepFlake, type Flake, type Random, type Size } from './model.ts';

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

function drawFlakes(ctx: CanvasRenderingContext2D, flakes: readonly Flake[], size: Size): void {
  ctx.clearRect(0, 0, size.width, size.height);
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
}

function sizeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, size: Size, pixelRatio: number): void {
  const dpr = Math.min(pixelRatio || 1, MAX_DPR);
  canvas.width = Math.round(size.width * dpr);
  canvas.height = Math.round(size.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function initSnow({ win, doc, random = Math.random }: SnowDeps): SnowController | null {
  const canvas = doc.querySelector<HTMLCanvasElement>('canvas.snow');
  const toggle = doc.querySelector<HTMLButtonElement>('.snow-toggle');
  const ctx = canvas?.getContext('2d') ?? null;
  if (!canvas || !toggle || !ctx) {
    return null;
  }

  const store = browserStore(win);
  const motion = reducedMotionQuery(win);
  // 減少動態一律優先：就算以前打開過，這次也先不下雪（使用者仍可手動打開）
  let enabled = !(motion?.matches ?? false) && readToggle(store, SNOW_KEY, true);
  let flakes: Flake[] = [];
  let size: Size = { width: 0, height: 0 };
  let frame: number | null = null;
  let last = 0;

  const resize = (): void => {
    const next = { width: win.innerWidth, height: win.innerHeight };
    if (next.width === size.width && next.height === size.height) {
      return;
    }
    sizeCanvas(canvas, ctx, next, win.devicePixelRatio);
    flakes = resizeFlakes(flakes, size, next, random);
    size = next;
  };

  const tick = (time: number): void => {
    const dt = last ? Math.min(time - last, MAX_STEP_MS) : 16;
    last = time;
    flakes = flakes.map((f) => stepFlake(f, dt, size.height));
    drawFlakes(ctx, flakes, size);
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
      ctx.clearRect(0, 0, size.width, size.height);
    }
  };

  /** remember=false：系統設定造成的關閉不算使用者的選擇，不寫進 localStorage */
  const setEnabled = (next: boolean, remember = true): void => {
    enabled = next;
    if (remember) {
      writeToggle(store, SNOW_KEY, next);
    }
    render();
  };

  toggle.hidden = false;
  toggle.addEventListener('click', () => setEnabled(!enabled));
  motion?.addEventListener?.('change', (event) => {
    if (event.matches) {
      setEnabled(false, false);
    }
  });
  doc.addEventListener('visibilitychange', () => (doc.hidden ? stop() : start()));
  win.addEventListener('resize', resize);
  resize();
  render();

  return { isRunning: () => frame !== null, setEnabled: (next) => setEnabled(next) };
}

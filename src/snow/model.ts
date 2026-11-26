export interface Flake {
  readonly x: number;
  readonly y: number;
  /** 每秒落下的 px */
  readonly speed: number;
  /** 左右晃動的幅度 px */
  readonly drift: number;
  readonly phase: number;
  /** 圓點是半徑，字元雪是字級 */
  readonly size: number;
  readonly alpha: number;
  readonly glyph: '0' | '1' | null;
}

export type Random = () => number;

export interface Size {
  readonly width: number;
  readonly height: number;
}

export const SNOW = { areaPerFlake: 12000, min: 40, max: 160, glyphRatio: 0.25 } as const;

export function flakeCount(width: number, height: number): number {
  const raw = Math.round((width * height) / SNOW.areaPerFlake);
  return Math.min(SNOW.max, Math.max(SNOW.min, raw));
}

const between = (rand: Random, min: number, max: number): number => min + rand() * (max - min);

export function createFlake(rand: Random, width: number, height: number): Flake {
  const isGlyph = rand() < SNOW.glyphRatio;
  return {
    x: rand() * width,
    y: rand() * height,
    speed: between(rand, 18, 60),
    drift: between(rand, 4, 14),
    phase: rand() * Math.PI * 2,
    size: isGlyph ? between(rand, 10, 14) : between(rand, 1, 2.5),
    alpha: isGlyph ? between(rand, 0.35, 0.7) : between(rand, 0.4, 0.9),
    glyph: isGlyph ? (rand() < 0.5 ? '0' : '1') : null,
  };
}

/**
 * 視窗改變大小時沿用既有雪花：x 依寬度等比縮放，數量不夠才補、太多就截掉。
 * 手機捲動時網址列收合只改高度，雪花不會整片重新產生而閃一下。
 */
export function resizeFlakes(flakes: readonly Flake[], from: Size, to: Size, rand: Random): Flake[] {
  const target = flakeCount(to.width, to.height);
  const scaleX = from.width > 0 ? to.width / from.width : 1;
  const kept = flakes.slice(0, target).map((f) => (scaleX === 1 ? f : { ...f, x: f.x * scaleX }));
  const added = Array.from({ length: target - kept.length }, () => createFlake(rand, to.width, to.height));
  return [...kept, ...added];
}

export function stepFlake(flake: Flake, dtMs: number, height: number): Flake {
  const y = flake.y + (flake.speed * dtMs) / 1000;
  return {
    ...flake,
    y: y > height + flake.size ? -flake.size : y,
    phase: flake.phase + dtMs / 1000,
  };
}

export function flakeX(flake: Flake): number {
  return flake.x + Math.sin(flake.phase) * flake.drift;
}

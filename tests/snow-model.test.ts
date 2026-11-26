import { describe, expect, it } from 'vitest';
import { SNOW, createFlake, flakeCount, flakeX, resizeFlakes, stepFlake, type Flake } from '../src/snow/model.ts';

/** 可重現的亂數（mulberry32） */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const flake: Flake = { x: 100, y: 50, speed: 40, drift: 10, phase: 0, size: 2, alpha: 0.8, glyph: null };

describe('flakeCount', () => {
  it.each([
    [320, 568, 40],
    [1440, 900, 108],
    [3840, 2160, 160],
  ])('%i x %i -> %i flakes', (w, h, expected) => {
    expect(flakeCount(w, h)).toBe(expected);
  });
});

describe('createFlake', () => {
  it('keeps flakes on screen with sane ranges', () => {
    const rand = seeded(1);
    for (let i = 0; i < 500; i += 1) {
      const f = createFlake(rand, 800, 600);
      expect(f.x).toBeGreaterThanOrEqual(0);
      expect(f.x).toBeLessThanOrEqual(800);
      expect(f.y).toBeGreaterThanOrEqual(0);
      expect(f.y).toBeLessThanOrEqual(600);
      expect(f.alpha).toBeGreaterThan(0);
      expect(f.alpha).toBeLessThanOrEqual(0.9);
    }
  });

  it('makes about a quarter of the flakes 0 or 1 glyphs', () => {
    const rand = seeded(42);
    const flakes = Array.from({ length: 4000 }, () => createFlake(rand, 800, 600));
    const glyphs = flakes.filter((f) => f.glyph !== null);
    expect(Math.abs(glyphs.length / flakes.length - SNOW.glyphRatio)).toBeLessThan(0.05);
    expect(new Set(glyphs.map((f) => f.glyph))).toEqual(new Set(['0', '1']));
  });
});

describe('stepFlake', () => {
  it('falls by speed x time and advances the sway phase', () => {
    const next = stepFlake(flake, 500, 600);
    expect(next.y).toBe(70);
    expect(next.phase).toBe(0.5);
    expect(flake.y).toBe(50);
  });

  it('wraps to just above the top after leaving the bottom', () => {
    const next = stepFlake({ ...flake, y: 601 }, 100, 600);
    expect(next.y).toBe(-2);
  });
});

describe('resizeFlakes', () => {
  const none = { width: 0, height: 0 };

  it('fills an empty sky with the right number of flakes', () => {
    expect(resizeFlakes([], none, { width: 1440, height: 900 }, seeded(3))).toHaveLength(108);
  });

  it('keeps the same flakes when only the height changes a little (mobile url bar)', () => {
    const flakes = resizeFlakes([], none, { width: 375, height: 700 }, seeded(4));
    const rand = seeded(5);
    const next = resizeFlakes(flakes, { width: 375, height: 700 }, { width: 375, height: 760 }, rand);
    expect(next).toEqual(flakes);
  });

  it('scales x to the new width and adds or drops flakes to match the new count', () => {
    const flakes = resizeFlakes([], none, { width: 800, height: 600 }, seeded(6));
    const wider = resizeFlakes(flakes, { width: 800, height: 600 }, { width: 1600, height: 1200 }, seeded(7));
    expect(wider).toHaveLength(160);
    expect(wider[0]!.x).toBeCloseTo(flakes[0]!.x * 2);
    expect(wider[0]!.y).toBe(flakes[0]!.y);

    const smaller = resizeFlakes(wider, { width: 1600, height: 1200 }, { width: 800, height: 600 }, seeded(8));
    expect(smaller).toHaveLength(40);
    expect(smaller[0]!.x).toBeCloseTo(flakes[0]!.x);
  });
});

describe('flakeX', () => {
  it('sways within the drift range', () => {
    expect(flakeX({ ...flake, phase: Math.PI / 2 })).toBeCloseTo(110);
    expect(flakeX({ ...flake, phase: -Math.PI / 2 })).toBeCloseTo(90);
  });
});

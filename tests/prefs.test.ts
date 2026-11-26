import { describe, expect, it } from 'vitest';
import { browserStore, prefersReducedMotion, readToggle, writeToggle, type KeyValueStore } from '../src/prefs.ts';

function memoryStore(): KeyValueStore & { readonly data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

const throwingStore: KeyValueStore = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('readToggle / writeToggle', () => {
  it('round-trips on and off', () => {
    const store = memoryStore();
    writeToggle(store, 'xmas-snow', false);
    expect(store.data.get('xmas-snow')).toBe('off');
    expect(readToggle(store, 'xmas-snow', true)).toBe(false);
    writeToggle(store, 'xmas-snow', true);
    expect(readToggle(store, 'xmas-snow', false)).toBe(true);
  });

  it('falls back when nothing usable is stored', () => {
    const store = memoryStore();
    store.data.set('xmas-snow', 'maybe');
    expect(readToggle(store, 'xmas-snow', true)).toBe(true);
    expect(readToggle(memoryStore(), 'xmas-snow', false)).toBe(false);
    expect(readToggle(null, 'xmas-snow', true)).toBe(true);
  });

  it('never throws when storage is blocked', () => {
    expect(readToggle(throwingStore, 'xmas-snow', true)).toBe(true);
    expect(() => writeToggle(throwingStore, 'xmas-snow', true)).not.toThrow();
  });
});

describe('browserStore', () => {
  it('returns null when reading localStorage throws', () => {
    const win = {
      get localStorage(): Storage {
        throw new Error('SecurityError');
      },
    } as unknown as Window;
    expect(browserStore(win)).toBeNull();
  });

  it('returns localStorage when available', () => {
    const store = memoryStore();
    expect(browserStore({ localStorage: store } as unknown as Window)).toBe(store);
  });
});

describe('prefersReducedMotion', () => {
  const withMatch = (matches: boolean) => ({ matchMedia: () => ({ matches }) }) as unknown as Window;

  it('follows the media query', () => {
    expect(prefersReducedMotion(withMatch(true))).toBe(true);
    expect(prefersReducedMotion(withMatch(false))).toBe(false);
  });

  it('assumes motion is fine when matchMedia is missing', () => {
    expect(prefersReducedMotion({} as Window)).toBe(false);
  });
});

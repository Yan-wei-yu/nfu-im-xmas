// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FONT_STYLESHEET, afterLoad, loadFonts } from '../src/fonts.ts';

describe('afterLoad', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'readyState');
  });

  it('runs right away when the page has already loaded', () => {
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'complete' });
    const fn = vi.fn();
    afterLoad(window, fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('waits for the load event while the page is still loading', () => {
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'interactive' });
    const fn = vi.fn();
    afterLoad(window, fn);
    expect(fn).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('load'));
    window.dispatchEvent(new Event('load'));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('loadFonts', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('adds the Google Fonts stylesheet after the page has rendered', () => {
    const link = loadFonts(document);
    expect(link.rel).toBe('stylesheet');
    expect(link.href).toBe(FONT_STYLESHEET);
    expect(document.head.querySelectorAll('link[data-fonts]')).toHaveLength(1);
  });

  it('does not add the stylesheet twice', () => {
    const first = loadFonts(document);
    expect(loadFonts(document)).toBe(first);
    expect(document.head.querySelectorAll('link[data-fonts]')).toHaveLength(1);
  });

  it('only loads fonts over https', () => {
    expect(FONT_STYLESHEET.startsWith('https://fonts.googleapis.com/css2?')).toBe(true);
    expect(FONT_STYLESHEET).toContain('display=swap');
  });
});

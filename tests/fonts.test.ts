// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { FONT_STYLESHEET, loadFonts } from '../src/fonts.ts';

describe('loadFonts', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('adds the Google Fonts stylesheet', () => {
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

  it('only loads fonts over https with swap', () => {
    expect(FONT_STYLESHEET.startsWith('https://fonts.googleapis.com/css2?')).toBe(true);
    expect(FONT_STYLESHEET).toContain('display=swap');
  });
});

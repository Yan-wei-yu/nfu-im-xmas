import { describe, expect, it } from 'vitest';
import { site } from '../src/data/site';
import { fillPlaceholders, renderPage } from '../src/render/page';

describe('renderPage', () => {
  it('renders every placeholder used by index.html', () => {
    expect(Object.keys(renderPage(site)).sort()).toEqual(
      ['cta', 'footer', 'gifts', 'head', 'hero', 'highlights', 'nav', 'partners', 'stats'].sort(),
    );
  });
});

describe('fillPlaceholders', () => {
  it('replaces each marker with its html', () => {
    const html = '<main><!-- @render:a --><!-- @render:b --></main>';
    expect(fillPlaceholders(html, { a: '<p>A</p>', b: '<p>B</p>' })).toBe('<main><p>A</p><p>B</p></main>');
  });

  it('fails on a marker without a renderer', () => {
    expect(() => fillPlaceholders('<!-- @render:missing -->', {})).toThrow(/No renderer for "missing"/);
  });

  it('fails on a renderer whose marker is missing', () => {
    expect(() => fillPlaceholders('<main></main>', { extra: '<p></p>' })).toThrow(/Unused renderer "extra"/);
  });

  it('keeps $ sequences in the html literally', () => {
    expect(fillPlaceholders('<!-- @render:a -->', { a: '$& $1' })).toBe('$& $1');
  });
});

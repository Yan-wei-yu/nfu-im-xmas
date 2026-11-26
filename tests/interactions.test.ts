// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { site } from '../src/data/site.ts';
import { initNav } from '../src/nav.ts';
import { renderHighlights, renderNav } from '../src/render/sections.ts';
import { layoutForHighlights, renderTreeSvg } from '../src/render/tree-svg.ts';
import { safeInit } from '../src/safe-init.ts';
import { initTree, openHighlight } from '../src/tree/tree.ts';

const details = (id: string): HTMLDetailsElement => document.getElementById(`hl-${id}`) as HTMLDetailsElement;

describe('openHighlight', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = renderHighlights(site.highlightsSection, site.highlights) + '<p id="hl-fake"></p>';
  });
  afterEach(() => vi.useRealTimers());

  it('opens the card and lights it briefly', () => {
    expect(openHighlight(window, document, '#hl-ai')).toBe(details('ai'));
    expect(details('ai').open).toBe(true);
    expect(details('ai').classList.contains('is-lit')).toBe(true);
    vi.advanceTimersByTime(1600);
    expect(details('ai').classList.contains('is-lit')).toBe(false);
  });

  it('restarts the glow when the same card is opened again', () => {
    openHighlight(window, document, '#hl-data');
    vi.advanceTimersByTime(1000);
    openHighlight(window, document, '#hl-data');
    vi.advanceTimersByTime(1000);
    expect(details('data').classList.contains('is-lit')).toBe(true);
    vi.advanceTimersByTime(600);
    expect(details('data').classList.contains('is-lit')).toBe(false);
  });

  it('ignores hashes that are not highlight cards', () => {
    expect(openHighlight(window, document, '#gifts')).toBeNull();
    expect(openHighlight(window, document, '#hl-missing')).toBeNull();
    expect(openHighlight(window, document, '#hl-fake')).toBeNull();
  });
});

describe('initTree', () => {
  beforeEach(() => {
    const tree = renderTreeSvg(layoutForHighlights(site.highlights), site.highlights, 'tree');
    document.body.innerHTML = tree + renderHighlights(site.highlightsSection, site.highlights);
    history.replaceState(null, '', '#');
  });

  it('opens the matching card when an ornament is clicked', () => {
    initTree(window, document);
    document.querySelector('a.ornament[href="#hl-global"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(details('global').open).toBe(true);
  });

  it('opens the card named in the url on load and on hash change', () => {
    history.replaceState(null, '', '#hl-career');
    initTree(window, document);
    expect(details('career').open).toBe(true);
    history.replaceState(null, '', '#hl-data');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(details('data').open).toBe(true);
  });
});

describe('initNav', () => {
  beforeEach(() => {
    document.body.innerHTML = renderNav(site.nav);
  });

  const toggle = (): HTMLButtonElement => document.querySelector<HTMLButtonElement>('.nav__toggle')!;
  const header = (): HTMLElement => document.querySelector<HTMLElement>('.site-header')!;

  it('reveals the toggle and opens and closes the menu', () => {
    initNav(document);
    expect(toggle().hidden).toBe(false);
    expect(header().classList.contains('has-js')).toBe(true);
    toggle().click();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(header().classList.contains('is-open')).toBe(true);
    toggle().click();
    expect(header().classList.contains('is-open')).toBe(false);
  });

  it('closes after picking a link or pressing Escape', () => {
    initNav(document);
    toggle().click();
    document.querySelector<HTMLAnchorElement>('.nav__menu a')!.click();
    expect(header().classList.contains('is-open')).toBe(false);
    toggle().click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle());
  });

  it('closes when the user clicks outside the header', () => {
    document.body.insertAdjacentHTML('beforeend', '<main><p id="outside">內容</p></main>');
    initNav(document);
    toggle().click();
    document.getElementById('outside')!.click();
    expect(header().classList.contains('is-open')).toBe(false);
    toggle().click();
    expect(header().classList.contains('is-open')).toBe(true);
  });

  it('does nothing when the nav is missing', () => {
    document.body.innerHTML = '';
    expect(() => initNav(document)).not.toThrow();
  });
});

describe('safeInit', () => {
  it('keeps going after a failing task and reports it', () => {
    const report = vi.fn();
    const ran: string[] = [];
    const failed = safeInit(
      [
        ['a', () => ran.push('a')],
        [
          'b',
          () => {
            throw new Error('boom');
          },
        ],
        ['c', () => ran.push('c')],
      ],
      report,
    );
    expect(ran).toEqual(['a', 'c']);
    expect(failed).toEqual(['b']);
    expect(report).toHaveBeenCalledWith('b', expect.any(Error));
  });

  it('logs failures to console.error by default', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    safeInit([
      [
        'x',
        () => {
          throw new Error('nope');
        },
      ],
    ]);
    expect(spy).toHaveBeenCalledWith('[init] x failed', expect.any(Error));
    spy.mockRestore();
  });
});

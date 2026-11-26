import { describe, expect, it } from 'vitest';
import { site } from '../src/data/site.ts';
import type { Highlight, IconName } from '../src/data/types.ts';
import { renderIcon } from '../src/render/icons.ts';
import { layoutForHighlights, renderTreeSvg } from '../src/render/tree-svg.ts';

const count = (html: string, pattern: RegExp): number => html.match(pattern)?.length ?? 0;

describe('renderIcon', () => {
  it.each<IconName>(['chip', 'chart', 'briefcase', 'globe', 'trophy', 'cap'])('draws %s as a decorative svg', (name) => {
    const svg = renderIcon(name);
    expect(svg).toMatch(/^<svg class="icon"[^>]*aria-hidden="true">/);
    expect(svg).toMatch(/<(path|rect|circle|ellipse)/);
  });
});

describe('renderTreeSvg', () => {
  const layout = layoutForHighlights(site.highlights);
  const svg = renderTreeSvg(layout, site.highlights, site.hero.treeLabel);

  it('labels the tree for screen readers', () => {
    expect(svg).toContain(`role="group" aria-label="${site.hero.treeLabel}"`);
  });

  it('links each ornament to its highlight card', () => {
    for (const h of site.highlights) {
      expect(svg).toContain(`<a class="ornament ornament--${h.color}" href="#hl-${h.id}" aria-label="${h.title}">`);
    }
    expect(count(svg, /<a class="ornament/g)).toBe(6);
  });

  it('gives each ornament a fixed hit area larger than its animated halo', () => {
    expect(count(svg, /<circle class="ornament__hit" cx="[\d.]+" cy="[\d.]+" r="26"\/>/g)).toBe(6);
  });

  it('draws 30 edges, 30 data flows and 15 plain nodes', () => {
    expect(count(svg, /<line x1=/g)).toBe(30);
    expect(count(svg, /class="tree__flow /g)).toBe(30);
    expect(count(svg, /class="tree__node /g)).toBe(15);
  });

  it('escapes ornament titles', () => {
    const tricky: Highlight = { ...site.highlights[0]!, title: 'A<B' };
    const html = renderTreeSvg(layoutForHighlights([tricky]), [tricky], 'tree');
    expect(html).toContain('aria-label="A&lt;B"');
    expect(html).not.toContain('A<B');
  });

  it('escapes ornament ids and color classes', () => {
    const hostile: Highlight = {
      ...site.highlights[0]!,
      id: 'ai" onfocus="pwn' as never,
      color: 'ice" data-pwned="yes' as never,
    };
    const html = renderTreeSvg(layoutForHighlights([hostile]), [hostile], 'tree');
    expect(html).not.toContain('" onfocus="pwn');
    expect(html).not.toContain('" data-pwned="yes');
    expect(html).toContain('href="#hl-ai&quot; onfocus=&quot;pwn"');
  });

  it('fails when an ornament has no matching highlight', () => {
    expect(() => renderTreeSvg(layout, site.highlights.slice(1), 'tree')).toThrow(/No highlight for ornament/);
  });
});

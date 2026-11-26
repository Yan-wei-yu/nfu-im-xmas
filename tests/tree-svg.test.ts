import { describe, expect, it } from 'vitest';
import { site } from '../src/data/site';
import type { Highlight, IconName } from '../src/data/types';
import { renderIcon } from '../src/render/icons';
import { layoutForHighlights, renderTreeSvg } from '../src/render/tree-svg';

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

  it('fails when an ornament has no matching highlight', () => {
    expect(() => renderTreeSvg(layout, site.highlights.slice(1), 'tree')).toThrow(/No highlight for ornament/);
  });
});

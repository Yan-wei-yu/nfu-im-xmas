import type { Site } from '../data/types.ts';
import { renderHead } from './head.ts';
import {
  renderCta,
  renderFooter,
  renderGifts,
  renderHero,
  renderHighlights,
  renderNav,
  renderPartners,
  renderStats,
} from './sections.ts';
import { layoutForHighlights, renderTreeSvg } from './tree-svg.ts';

export type RenderedSections = Readonly<Record<string, string>>;

export function renderPage(site: Site): RenderedSections {
  const tree = renderTreeSvg(layoutForHighlights(site.highlights), site.highlights, site.hero.treeLabel);
  return {
    head: renderHead(site.meta),
    nav: renderNav(site.nav),
    hero: renderHero(site.hero, tree),
    highlights: renderHighlights(site.highlightsSection, site.highlights),
    gifts: renderGifts(site.giftsSection, site.gifts),
    stats: renderStats(site.statsSection, site.stats),
    partners: renderPartners(site.partnersSection, site.partners),
    cta: renderCta(site.cta),
    footer: renderFooter(site.footer),
  };
}

const MARKER = /<!-- @render:([a-z]+) -->/g;

export function fillPlaceholders(html: string, sections: RenderedSections): string {
  const used = new Set<string>();
  const filled = html.replace(MARKER, (_match, name: string) => {
    const section = sections[name];
    if (section === undefined) {
      throw new Error(`No renderer for "${name}"`);
    }
    used.add(name);
    return section;
  });
  const unused = Object.keys(sections).find((name) => !used.has(name));
  if (unused) {
    throw new Error(`Unused renderer "${unused}"`);
  }
  return filled;
}

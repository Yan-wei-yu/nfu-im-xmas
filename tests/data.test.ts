import { describe, expect, it } from 'vitest';
import { site } from '../src/data/site.ts';
import type { Link } from '../src/data/types.ts';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function allUrls(): string[] {
  const links: Link[] = [
    ...site.nav.items,
    site.nav.official,
    ...site.highlights.flatMap((h) => h.links),
    site.giftsSection.video,
    site.giftsSection.more,
    site.cta.primary,
    site.cta.secondary,
    ...site.footer.quickLinks,
  ];
  return [...links.map((l) => l.url), ...site.gifts.map((g) => g.url), site.meta.url, site.meta.ogImage];
}

describe('site data', () => {
  it('has six highlights with unique ids and filled fields', () => {
    expect(site.highlights).toHaveLength(6);
    expect(new Set(site.highlights.map((h) => h.id)).size).toBe(6);
    for (const h of site.highlights) {
      expect(h.title.trim()).not.toBe('');
      expect(h.tagline.trim()).not.toBe('');
      h.points.forEach((p) => expect(p.trim()).not.toBe(''));
      expect(h.links.length).toBeGreaterThan(0);
    }
  });

  it('places ornaments where the spec says', () => {
    const placements = Object.fromEntries(site.highlights.map((h) => [h.id, h.ornament]));
    expect(placements).toEqual({
      ai: { layer: 2, index: 0 },
      data: { layer: 3, index: 2 },
      intern: { layer: 4, index: 1 },
      global: { layer: 5, index: 3 },
      project: { layer: 6, index: 0 },
      career: { layer: 6, index: 5 },
    });
  });

  it('uses only https, mailto or in-page urls', () => {
    for (const url of allUrls()) {
      expect(url).toMatch(/^(https:\/\/|mailto:|#)/);
    }
  });

  it('lists six gifts, newest first, with ISO dates', () => {
    expect(site.gifts).toHaveLength(6);
    site.gifts.forEach((g) => expect(g.date).toMatch(ISO_DATE));
    const dates = site.gifts.map((g) => g.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('drops the student name from the logo award title', () => {
    const award = site.gifts.find((g) => g.title.includes('LOGO'));
    expect(award?.title.startsWith('本系同學')).toBe(true);
  });

  it('has four stats and eight partners', () => {
    expect(site.stats).toHaveLength(4);
    expect(site.partners).toHaveLength(8);
  });
});

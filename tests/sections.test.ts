import { describe, expect, it } from 'vitest';
import { site } from '../src/data/site.ts';
import { renderHead } from '../src/render/head.ts';
import {
  renderCta,
  renderFooter,
  renderGifts,
  renderHero,
  renderHighlights,
  renderNav,
  renderPartners,
  renderStats,
} from '../src/render/sections.ts';

const count = (html: string, pattern: RegExp): number => html.match(pattern)?.length ?? 0;

describe('renderNav', () => {
  const html = renderNav(site.nav);

  it('links to the four in-page sections and the official site', () => {
    for (const item of site.nav.items) {
      expect(html).toContain(`href="${item.url}"`);
    }
    expect(html).toContain('href="https://im.nfu.edu.tw/" target="_blank" rel="noopener noreferrer"');
  });

  it('ships the mobile toggle hidden until JS wires it up', () => {
    expect(html).toContain('aria-expanded="false" aria-controls="nav-menu" hidden');
    expect(html).toContain('id="nav-menu"');
  });
});

describe('renderHero', () => {
  const html = renderHero(site.hero, '<svg class="tree"></svg>');

  it('shows both title lines, the countdown fallback and the tree', () => {
    expect(html).toContain('<h1 class="hero__title" id="hero-title">');
    expect(html).toContain('虎科資管');
    expect(html).toContain('Merry Christmas');
    expect(html).toContain('data-countdown aria-live="polite">12/25 聖誕快樂</p>');
    expect(html).toContain('<div class="hero__tree"><svg class="tree"></svg></div>');
  });
});

describe('renderHighlights', () => {
  const html = renderHighlights(site.highlightsSection, site.highlights);

  it('renders one details card per highlight with points and links', () => {
    expect(count(html, /<details class="hl /g)).toBe(6);
    for (const h of site.highlights) {
      expect(html).toContain(`id="hl-${h.id}"`);
      h.points.forEach((p) => expect(html).toContain(`<li>${p}</li>`));
    }
    expect(html).toContain('<span class="hl__index">01</span>');
    expect(html).toContain('<span class="hl__index">06</span>');
    expect(count(html, /class="hl__link"/g)).toBe(7);
  });
});

describe('renderGifts', () => {
  const html = renderGifts(site.giftsSection, site.gifts);

  it('lists six gifts with machine-readable dates and external links', () => {
    expect(count(html, /<li class="gift">/g)).toBe(6);
    expect(html).toContain('<time class="gift__date" datetime="2026-06-17">2026-06-17</time>');
    expect(count(html, /class="gift__title" href="https:\/\/im\.nfu\.edu\.tw/g)).toBe(6);
  });

  it('links the intro video and the full news list', () => {
    expect(html).toContain('60 秒認識虎科資管');
    expect(html).toContain('href="https://im.nfu.edu.tw/zh_tw/news"');
  });
});

describe('renderStats', () => {
  const html = renderStats(site.statsSection, site.stats);

  it('prints final numbers in the html so they show without JS', () => {
    expect(html).toContain('data-countup="95" data-suffix="%">95%</p>');
    expect(html).toContain('data-countup="50" data-suffix="+">50+</p>');
    expect(html).toContain('data-countup="100" data-suffix="+">100+</p>');
  });

  it('fills the ring to 95 percent and labels the venn diagram', () => {
    expect(html).toContain('stroke-dasharray="326.73" stroke-dashoffset="16.34" data-ring="95"');
    expect(html).toContain('AI × 數據 × 商管');
  });
});

describe('renderPartners, renderCta and renderFooter', () => {
  it('renders eight partner tags', () => {
    expect(count(renderPartners(site.partnersSection, site.partners), /<li class="partner">/g)).toBe(8);
  });

  it('renders a primary and a ghost call to action', () => {
    const html = renderCta(site.cta);
    expect(html).toContain('class="btn btn--primary" href="https://im.nfu.edu.tw/zh_tw/course"');
    expect(html).toContain('class="btn btn--ghost" href="https://line.me/R/ti/p/@218jnlb"');
  });

  it('renders contact details, quick links and the disclaimer', () => {
    const html = renderFooter(site.footer);
    expect(html).toContain('<footer class="site-footer" id="contact">');
    expect(html).toContain('href="mailto:imoffice@nfu.edu.tw"');
    expect(count(html, /class="footer__link"/g)).toBe(7);
    expect(html).toContain(site.footer.disclaimer);
  });
});

describe('renderHead', () => {
  it('writes title, canonical and open graph tags', () => {
    const html = renderHead(site.meta);
    expect(html).toContain(`<title>${site.meta.title}</title>`);
    expect(html).toContain('<link rel="canonical" href="https://nfu-im-xmas.vercel.app/" />');
    expect(html).toContain('<meta property="og:image" content="https://nfu-im-xmas.vercel.app/og.png" />');
  });

  it('escapes quotes in meta content', () => {
    expect(renderHead({ ...site.meta, description: 'a "quoted" text' })).toContain(
      'content="a &quot;quoted&quot; text"',
    );
  });
});

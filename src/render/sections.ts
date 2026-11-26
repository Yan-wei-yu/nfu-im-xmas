import type { Gift, Highlight, Site, Stat } from '../data/types.ts';
import { escapeHtml, renderLink } from './html.ts';
import { renderIcon } from './icons.ts';

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = Math.round(2 * Math.PI * RING_RADIUS * 100) / 100;

const GIFT_BOX =
  '<svg class="gift__box" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
  '<rect class="gift__base" x="4" y="10" width="16" height="11" rx="1.5"/>' +
  '<rect class="gift__lid" x="3" y="6" width="18" height="4" rx="1"/>' +
  '<path class="gift__ribbon" d="M12 6v15"/></svg>';

function sectionHead(id: string, title: string, lead?: string): string {
  const leadHtml = lead ? `<p class="section__lead">${escapeHtml(lead)}</p>` : '';
  return `<div class="section__head"><h2 class="section__title" id="${id}">${escapeHtml(title)}</h2>${leadHtml}</div>`;
}

export function renderNav(nav: Site['nav']): string {
  const items = nav.items.map((item) => `<li>${renderLink(item, { className: 'nav__link' })}</li>`).join('');
  const official = renderLink(nav.official, { className: 'nav__link nav__link--official', arrow: true });
  return (
    '<header class="site-header"><nav class="nav" aria-label="主選單">' +
    `<a class="nav__brand" href="#top">${escapeHtml(nav.brand)}</a>` +
    '<button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-menu" hidden>選單</button>' +
    `<ul class="nav__menu" id="nav-menu">${items}<li>${official}</li></ul>` +
    '</nav></header>'
  );
}

export function renderHero(hero: Site['hero'], treeSvg: string): string {
  const [line1, line2] = hero.titleLines;
  return (
    '<section class="hero" id="top" aria-labelledby="hero-title">' +
    '<div class="hero__text">' +
    `<p class="hero__org">${escapeHtml(hero.org)}</p>` +
    `<p class="hero__eyebrow"><code>${escapeHtml(hero.eyebrow)}</code></p>` +
    '<h1 class="hero__title" id="hero-title">' +
    `<span class="hero__line">${escapeHtml(line1)}</span>` +
    `<span class="hero__line hero__line--accent">${escapeHtml(line2)}</span></h1>` +
    `<p class="hero__subtitle">${escapeHtml(hero.subtitle)}</p>` +
    `<p class="hero__countdown" data-countdown aria-live="polite">${escapeHtml(hero.countdownFallback)}</p>` +
    '</div>' +
    `<div class="hero__tree">${treeSvg}</div>` +
    '</section>'
  );
}

function renderHighlight(h: Highlight, order: number): string {
  const points = h.points.map((p) => `<li>${escapeHtml(p)}</li>`).join('');
  const links = h.links.map((l) => renderLink(l, { className: 'hl__link', arrow: true })).join('');
  const id = escapeHtml(h.id);
  const color = escapeHtml(h.color);
  return (
    `<details class="hl hl--${id} hl--${color}" id="hl-${id}">` +
    '<summary class="hl__summary">' +
    `<span class="hl__index">${String(order + 1).padStart(2, '0')}</span>` +
    `<span class="hl__icon">${renderIcon(h.icon)}</span>` +
    `<span class="hl__title">${escapeHtml(h.title)}</span>` +
    `<span class="hl__tagline">${escapeHtml(h.tagline)}</span>` +
    '</summary>' +
    `<div class="hl__body"><ul class="hl__points">${points}</ul><p class="hl__links">${links}</p></div>` +
    '</details>'
  );
}

export function renderHighlights(section: Site['highlightsSection'], highlights: readonly Highlight[]): string {
  return (
    '<section class="section highlights" id="highlights" aria-labelledby="highlights-title">' +
    sectionHead('highlights-title', section.title, section.lead) +
    `<div class="highlights__grid">${highlights.map((h, i) => renderHighlight(h, i)).join('')}</div>` +
    '</section>'
  );
}

function renderGift(g: Gift): string {
  return (
    `<li class="gift">${GIFT_BOX}` +
    `<time class="gift__date" datetime="${escapeHtml(g.date)}">${escapeHtml(g.date)}</time>` +
    `<span class="gift__tag">${escapeHtml(g.category)}</span>` +
    renderLink({ label: g.title, url: g.url }, { className: 'gift__title' }) +
    '</li>'
  );
}

export function renderGifts(section: Site['giftsSection'], gifts: readonly Gift[]): string {
  return (
    '<section class="section gifts" id="gifts" aria-labelledby="gifts-title">' +
    sectionHead('gifts-title', section.title, section.lead) +
    `<p class="gifts__video">${renderLink(section.video, { className: 'chip-link', arrow: true })}</p>` +
    `<ol class="gifts__list">${gifts.map(renderGift).join('')}</ol>` +
    `<p class="gifts__more">${renderLink(section.more, { className: 'text-link', arrow: true })}</p>` +
    '</section>'
  );
}

function statValue(value: number, suffix: string): string {
  const s = escapeHtml(suffix);
  return `<p class="stat__value" data-countup="${value}" data-suffix="${s}">${value}${s}</p>`;
}

function renderStat(stat: Stat): string {
  const label = `<figcaption class="stat__label">${escapeHtml(stat.label)}</figcaption>`;
  switch (stat.kind) {
    case 'ring': {
      const offset = Math.round(RING_CIRCUMFERENCE * (1 - stat.value / 100) * 100) / 100;
      return (
        '<figure class="stat stat--ring">' +
        '<svg class="ring" viewBox="0 0 120 120" aria-hidden="true">' +
        `<circle class="ring__track" cx="60" cy="60" r="${RING_RADIUS}"/>` +
        `<circle class="ring__value" cx="60" cy="60" r="${RING_RADIUS}" stroke-dasharray="${RING_CIRCUMFERENCE}" stroke-dashoffset="${offset}" data-ring="${stat.value}"/>` +
        `</svg>${statValue(stat.value, stat.suffix)}${label}</figure>`
      );
    }
    case 'count':
      return `<figure class="stat stat--count">${statValue(stat.value, stat.suffix)}${label}</figure>`;
    case 'venn': {
      const [a, b, c] = [escapeHtml(stat.parts[0]), escapeHtml(stat.parts[1]), escapeHtml(stat.parts[2])];
      return (
        '<figure class="stat stat--venn">' +
        '<svg class="venn" viewBox="0 0 160 140" aria-hidden="true">' +
        '<circle class="venn__a" cx="58" cy="56" r="40"/>' +
        '<circle class="venn__b" cx="102" cy="56" r="40"/>' +
        '<circle class="venn__c" cx="80" cy="94" r="40"/>' +
        `<text x="40" y="50">${a}</text>` +
        `<text x="120" y="50" text-anchor="end">${b}</text>` +
        `<text x="80" y="120" text-anchor="middle">${c}</text>` +
        '</svg>' +
        `<p class="stat__value stat__value--text">${a} × ${b} × ${c}</p>${label}</figure>`
      );
    }
  }
}

export function renderStats(section: Site['statsSection'], stats: readonly Stat[]): string {
  return (
    '<section class="section stats" id="stats" aria-labelledby="stats-title">' +
    sectionHead('stats-title', section.title) +
    `<div class="stats__grid">${stats.map(renderStat).join('')}</div>` +
    '</section>'
  );
}

export function renderPartners(section: Site['partnersSection'], partners: readonly string[]): string {
  const items = partners.map((p) => `<li class="partner">${escapeHtml(p)}</li>`).join('');
  return (
    '<section class="section partners" aria-labelledby="partners-title">' +
    sectionHead('partners-title', section.title) +
    `<ul class="partners__list">${items}</ul>` +
    '</section>'
  );
}

export function renderCta(cta: Site['cta']): string {
  return (
    '<section class="section cta" aria-labelledby="cta-title">' +
    `<h2 class="cta__title" id="cta-title">${escapeHtml(cta.title)}</h2>` +
    `<p class="cta__lead">${escapeHtml(cta.lead)}</p>` +
    '<div class="cta__actions">' +
    renderLink(cta.primary, { className: 'btn btn--primary', arrow: true }) +
    renderLink(cta.secondary, { className: 'btn btn--ghost', arrow: true }) +
    '</div></section>'
  );
}

export function renderFooter(footer: Site['footer']): string {
  const links = footer.quickLinks.map((l) => `<li>${renderLink(l, { className: 'footer__link' })}</li>`).join('');
  return (
    '<footer class="site-footer" id="contact">' +
    '<div class="footer__grid">' +
    '<address class="footer__contact">' +
    `<p class="footer__org">${escapeHtml(footer.org)}</p>` +
    `<p>${escapeHtml(footer.address)}</p>` +
    `<p>電話 ${escapeHtml(footer.tel)}　傳真 ${escapeHtml(footer.fax)}</p>` +
    `<p>${renderLink({ label: footer.email, url: `mailto:${footer.email}` })}</p>` +
    '</address>' +
    '<nav class="footer__nav" aria-labelledby="footer-links-title">' +
    '<h2 class="footer__heading" id="footer-links-title">系網快速連結</h2>' +
    `<ul class="footer__links">${links}</ul></nav>` +
    '</div>' +
    `<p class="footer__disclaimer">${escapeHtml(footer.disclaimer)}</p>` +
    '<p class="footer__top"><a href="#top">回到頁首 ↑</a></p>' +
    '</footer>'
  );
}

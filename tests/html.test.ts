import { describe, expect, it } from 'vitest';
import { escapeHtml, renderLink, safeUrl } from '../src/render/html';

describe('escapeHtml', () => {
  it('escapes the five html special characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('虎科資管 AI × 數據')).toBe('虎科資管 AI × 數據');
  });
});

describe('safeUrl', () => {
  it.each(['https://im.nfu.edu.tw/', 'mailto:imoffice@nfu.edu.tw', '#highlights'])('accepts %s', (url) => {
    expect(safeUrl(url)).toBe(url);
  });

  it.each(['javascript:alert(1)', 'http://im.nfu.edu.tw/', '/zh_tw/news', 'data:text/html,hi'])(
    'rejects %s',
    (url) => {
      expect(() => safeUrl(url)).toThrow(/Unsafe URL/);
    },
  );
});

describe('renderLink', () => {
  it('opens external links in a new tab and says so to screen readers', () => {
    const html = renderLink({ label: '官方系網', url: 'https://im.nfu.edu.tw/' });
    expect(html).toBe(
      '<a href="https://im.nfu.edu.tw/" target="_blank" rel="noopener noreferrer">官方系網<span class="sr-only">（另開新分頁）</span></a>',
    );
  });

  it('keeps in-page and mailto links in the same tab', () => {
    expect(renderLink({ label: '特色', url: '#highlights' })).toBe('<a href="#highlights">特色</a>');
    expect(renderLink({ label: 'Email', url: 'mailto:a@b.tw' })).toBe('<a href="mailto:a@b.tw">Email</a>');
  });

  it('adds a class and a decorative arrow when asked', () => {
    const html = renderLink({ label: '了解課程', url: '#x' }, { className: 'btn btn--primary', arrow: true });
    expect(html).toBe('<a class="btn btn--primary" href="#x">了解課程<span aria-hidden="true"> ↗</span></a>');
  });

  it('escapes labels and refuses unsafe urls', () => {
    expect(renderLink({ label: '<b>', url: '#x' })).toContain('&lt;b&gt;');
    expect(() => renderLink({ label: 'x', url: 'javascript:void(0)' })).toThrow(/Unsafe URL/);
  });
});

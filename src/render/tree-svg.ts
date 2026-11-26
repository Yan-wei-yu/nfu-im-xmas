import type { Highlight } from '../data/types.ts';
import { computeTreeLayout, type OrnamentPlacement, type TreeLayout } from '../tree/layout.ts';
import { escapeHtml } from './html.ts';

/** 標籤寬度用字數估算：每字 14px，左右各留 8px */
const LABEL_CHAR_WIDTH = 14;
const LABEL_PADDING = 16;
const FLOW_GROUPS = 5;

export function layoutForHighlights(highlights: readonly Highlight[]): TreeLayout {
  return computeTreeLayout(
    highlights.map((h) => ({ key: h.id, layer: h.ornament.layer, index: h.ornament.index })),
  );
}

function renderOrnament(placement: OrnamentPlacement, highlight: Highlight): string {
  const { x, y } = placement.node;
  const title = escapeHtml(highlight.title);
  const width = highlight.title.length * LABEL_CHAR_WIDTH + LABEL_PADDING;
  return (
    `<a class="ornament ornament--${highlight.color}" href="#hl-${highlight.id}" aria-label="${title}">` +
    `<circle class="ornament__halo" cx="${x}" cy="${y}" r="20"/>` +
    `<circle class="ornament__ball" cx="${x}" cy="${y}" r="12"/>` +
    `<g class="ornament__label" aria-hidden="true">` +
    `<rect x="${x - width / 2}" y="${y - 50}" width="${width}" height="26" rx="13"/>` +
    `<text x="${x}" y="${y - 32}" text-anchor="middle">${title}</text>` +
    `</g></a>`
  );
}

export function renderTreeSvg(layout: TreeLayout, highlights: readonly Highlight[], label: string): string {
  const byId = new Map<string, Highlight>(highlights.map((h) => [h.id, h]));
  const ornamentNodes = new Set(layout.ornaments.map((o) => o.node.id));

  const edges = layout.edges
    .map((e) => `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}"/>`)
    .join('');
  // 資料由下往上流：光點從子節點畫向父節點
  const flows = layout.edges
    .map(
      (e, i) =>
        `<line class="tree__flow tree__flow--t${i % FLOW_GROUPS}" x1="${e.x2}" y1="${e.y2}" x2="${e.x1}" y2="${e.y1}"/>`,
    )
    .join('');
  const nodes = layout.nodes
    .filter((n) => !ornamentNodes.has(n.id))
    .map(
      (n) =>
        `<circle class="tree__node tree__node--t${(n.layer + n.index) % FLOW_GROUPS}" cx="${n.x}" cy="${n.y}" r="5"/>`,
    )
    .join('');
  const ornaments = layout.ornaments
    .map((o) => {
      const highlight = byId.get(o.key);
      if (!highlight) {
        throw new Error(`No highlight for ornament ${o.key}`);
      }
      return renderOrnament(o, highlight);
    })
    .join('');
  const { trunk, star } = layout;

  return (
    `<svg class="tree" viewBox="0 0 ${layout.width} ${layout.height}" role="group" aria-label="${escapeHtml(label)}">` +
    `<g class="tree__edges" aria-hidden="true">${edges}</g>` +
    `<g class="tree__flows" aria-hidden="true">${flows}</g>` +
    `<g aria-hidden="true">${nodes}` +
    `<rect class="tree__trunk" x="${trunk.x}" y="${trunk.y}" width="${trunk.width}" height="${trunk.height}" rx="3"/>` +
    `<polygon class="tree__star" points="${star.points}"/></g>` +
    `<g class="tree__ornaments">${ornaments}</g>` +
    `</svg>`
  );
}

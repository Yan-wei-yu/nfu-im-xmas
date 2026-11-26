import { describe, expect, it } from 'vitest';
import { TREE, computeTreeLayout, starPoints } from '../src/tree/layout.ts';

const ORNAMENTS = [
  { key: 'ai', layer: 2, index: 0 },
  { key: 'career', layer: 6, index: 5 },
];

describe('computeTreeLayout', () => {
  const layout = computeTreeLayout(ORNAMENTS);

  it('builds 21 nodes in 6 layers', () => {
    expect(layout.nodes).toHaveLength(21);
    for (let layer = 1; layer <= TREE.layers; layer += 1) {
      expect(layout.nodes.filter((n) => n.layer === layer)).toHaveLength(layer);
    }
  });

  it('links every node to its two neighbours one layer down', () => {
    expect(layout.edges).toHaveLength(30);
    const byId = new Map(layout.nodes.map((n) => [n.id, n]));
    for (const edge of layout.edges) {
      const from = byId.get(edge.from);
      const to = byId.get(edge.to);
      expect(from && to).toBeTruthy();
      expect(to!.layer).toBe(from!.layer + 1);
      expect([from!.index, from!.index + 1]).toContain(to!.index);
      expect([edge.x1, edge.y1, edge.x2, edge.y2]).toEqual([from!.x, from!.y, to!.x, to!.y]);
    }
  });

  it('keeps every shape inside the view box', () => {
    for (const n of layout.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(layout.width);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(layout.height);
    }
    expect(layout.trunk.y + layout.trunk.height).toBeLessThanOrEqual(layout.height);
    expect(layout.star.y).toBeGreaterThan(0);
  });

  it('hangs ornaments on the requested nodes', () => {
    expect(layout.ornaments.map((o) => [o.key, o.node.id])).toEqual([
      ['ai', 'n-2-0'],
      ['career', 'n-6-5'],
    ]);
  });

  it('rejects ornaments outside the tree or on the same node', () => {
    expect(() => computeTreeLayout([{ key: 'x', layer: 7, index: 0 }])).toThrow(/No tree node/);
    expect(() =>
      computeTreeLayout([
        { key: 'a', layer: 3, index: 1 },
        { key: 'b', layer: 3, index: 1 },
      ]),
    ).toThrow(/share a node/);
  });

  it('is deterministic', () => {
    expect(computeTreeLayout(ORNAMENTS)).toEqual(layout);
  });
});

describe('starPoints', () => {
  it('returns ten points starting at the top tip', () => {
    const points = starPoints(200, 40, 20, 8).split(' ');
    expect(points).toHaveLength(10);
    expect(points[0]).toBe('200,20');
  });
});

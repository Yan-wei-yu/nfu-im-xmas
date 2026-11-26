export interface TreeNode {
  readonly id: string;
  readonly layer: number;
  readonly index: number;
  readonly x: number;
  readonly y: number;
}

export interface TreeEdge {
  readonly from: string;
  readonly to: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface OrnamentInput {
  readonly key: string;
  readonly layer: number;
  readonly index: number;
}

export interface OrnamentPlacement {
  readonly key: string;
  readonly node: TreeNode;
}

export interface TreeLayout {
  readonly width: number;
  readonly height: number;
  readonly nodes: readonly TreeNode[];
  readonly edges: readonly TreeEdge[];
  readonly star: { readonly x: number; readonly y: number; readonly points: string };
  readonly trunk: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
  readonly ornaments: readonly OrnamentPlacement[];
}

export const TREE = {
  width: 400,
  height: 440,
  layers: 6,
  centerX: 200,
  topY: 84,
  layerGap: 58,
  nodeGap: 58,
} as const;

const round = (n: number): number => Math.round(n * 100) / 100;

const nodeId = (layer: number, index: number): string => `n-${layer}-${index}`;

export function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  return Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${round(cx + radius * Math.cos(angle))},${round(cy + radius * Math.sin(angle))}`;
  }).join(' ');
}

function buildNodes(): TreeNode[] {
  const nodes: TreeNode[] = [];
  for (let layer = 1; layer <= TREE.layers; layer += 1) {
    for (let index = 0; index < layer; index += 1) {
      nodes.push({
        id: nodeId(layer, index),
        layer,
        index,
        x: round(TREE.centerX + (index - (layer - 1) / 2) * TREE.nodeGap),
        y: TREE.topY + (layer - 1) * TREE.layerGap,
      });
    }
  }
  return nodes;
}

function lookup(byId: ReadonlyMap<string, TreeNode>, layer: number, index: number): TreeNode {
  const node = byId.get(nodeId(layer, index));
  if (!node) {
    throw new Error(`No tree node at layer ${layer}, index ${index}`);
  }
  return node;
}

export function computeTreeLayout(ornaments: readonly OrnamentInput[]): TreeLayout {
  const nodes = buildNodes();
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const edges = nodes
    .filter((n) => n.layer < TREE.layers)
    .flatMap((n) =>
      [n.index, n.index + 1].map((childIndex) => {
        const child = lookup(byId, n.layer + 1, childIndex);
        return { from: n.id, to: child.id, x1: n.x, y1: n.y, x2: child.x, y2: child.y };
      }),
    );

  const placements = ornaments.map((o) => ({ key: o.key, node: lookup(byId, o.layer, o.index) }));
  if (new Set(placements.map((p) => p.node.id)).size !== placements.length) {
    throw new Error('Two ornaments share a node');
  }

  const starY = TREE.topY - 46;
  const bottomY = TREE.topY + (TREE.layers - 1) * TREE.layerGap;
  return {
    width: TREE.width,
    height: TREE.height,
    nodes,
    edges,
    star: { x: TREE.centerX, y: starY, points: starPoints(TREE.centerX, starY, 20, 8.5) },
    trunk: { x: TREE.centerX - 13, y: bottomY + 12, width: 26, height: 40 },
    ornaments: placements,
  };
}

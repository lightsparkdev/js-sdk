export interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface LayoutNode extends SankeyNode {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  value: number;
  sourceLinks: LayoutLink[];
  targetLinks: LayoutLink[];
  column: number;
}

export interface LayoutLink extends SankeyLink {
  sourceNode: LayoutNode;
  targetNode: LayoutNode;
  width: number;
  sy: number;
  ty: number;
}

export interface SankeyLayoutResult {
  nodes: LayoutNode[];
  links: LayoutLink[];
}

const RELAXATION_ITERATIONS = 32;

export function computeSankeyLayout(
  data: SankeyData,
  width: number,
  height: number,
  nodeWidth: number,
  nodePadding: number,
): SankeyLayoutResult {
  if (data.nodes.length === 0) return { nodes: [], links: [] };

  const nodeMap = new Map<string, LayoutNode>();
  for (const n of data.nodes) {
    nodeMap.set(n.id, {
      ...n,
      x0: 0,
      x1: 0,
      y0: 0,
      y1: 0,
      value: 0,
      sourceLinks: [],
      targetLinks: [],
      column: 0,
    });
  }

  const layoutLinks: LayoutLink[] = [];
  for (const l of data.links) {
    const sourceNode = nodeMap.get(l.source);
    const targetNode = nodeMap.get(l.target);
    if (!sourceNode || !targetNode) continue;
    layoutLinks.push({ ...l, sourceNode, targetNode, width: 0, sy: 0, ty: 0 });
  }

  for (const link of layoutLinks) {
    link.sourceNode.sourceLinks.push(link);
    link.targetNode.targetLinks.push(link);
  }

  const nodes = Array.from(nodeMap.values());
  computeNodeValues(nodes);
  computeNodeColumns(nodes);
  computeNodePositions(nodes, width, height, nodeWidth, nodePadding);
  computeLinkWidthsAndOffsets(nodes);

  return { nodes, links: layoutLinks };
}

function computeNodeValues(nodes: LayoutNode[]) {
  for (const node of nodes) {
    const sumSource = node.sourceLinks.reduce((s, l) => s + l.value, 0);
    const sumTarget = node.targetLinks.reduce((s, l) => s + l.value, 0);
    node.value = Math.max(sumSource, sumTarget);
  }
}

function computeNodeColumns(nodes: LayoutNode[]) {
  const remaining = new Set(nodes);
  let column = 0;

  while (remaining.size > 0) {
    const current: LayoutNode[] = [];
    for (const node of remaining) {
      if (node.targetLinks.every((l) => !remaining.has(l.sourceNode))) {
        current.push(node);
      }
    }
    if (current.length === 0) {
      for (const node of remaining) {
        node.column = column;
      }
      break;
    }
    for (const node of current) {
      node.column = column;
      remaining.delete(node);
    }
    column++;
  }
}

function computeNodePositions(
  nodes: LayoutNode[],
  width: number,
  height: number,
  nodeWidth: number,
  nodePadding: number,
) {
  const maxColumn = Math.max(...nodes.map((n) => n.column), 0);
  const columns = new Map<number, LayoutNode[]>();
  for (const node of nodes) {
    if (!columns.has(node.column)) columns.set(node.column, []);
    columns.get(node.column)!.push(node);
  }

  const colWidth = maxColumn > 0 ? (width - nodeWidth) / maxColumn : 0;
  for (const node of nodes) {
    node.x0 = node.column * colWidth;
    node.x1 = node.x0 + nodeWidth;
  }

  const ky = Math.min(
    ...Array.from(columns.values()).map((col) => {
      const totalValue = col.reduce((s, n) => s + n.value, 0);
      const totalPadding = Math.max(0, col.length - 1) * nodePadding;
      return totalValue > 0 ? (height - totalPadding) / totalValue : height;
    }),
  );

  for (const [, col] of columns) {
    let y = 0;
    col.sort((a, b) => b.value - a.value);
    for (const node of col) {
      node.y0 = y;
      node.y1 = y + node.value * ky;
      y = node.y1 + nodePadding;
    }
    resolveCollisions(col, nodePadding, height);
  }

  for (let iter = 0; iter < RELAXATION_ITERATIONS; iter++) {
    const alpha = Math.pow(0.99, iter + 1);
    if (iter % 2 === 0) {
      relaxRight(columns, alpha, nodePadding, height);
    } else {
      relaxLeft(columns, alpha, nodePadding, maxColumn, height);
    }
  }
}

function relaxRight(
  columns: Map<number, LayoutNode[]>,
  alpha: number,
  nodePadding: number,
  height: number,
) {
  const maxCol = Math.max(...columns.keys(), 0);
  for (let c = 1; c <= maxCol; c++) {
    const col = columns.get(c);
    if (!col) continue;
    for (const node of col) {
      if (node.targetLinks.length === 0) continue;
      let weightedY = 0;
      let totalWeight = 0;
      for (const link of node.targetLinks) {
        const sourceCenter = (link.sourceNode.y0 + link.sourceNode.y1) / 2;
        weightedY += sourceCenter * link.value;
        totalWeight += link.value;
      }
      if (totalWeight === 0) continue;
      const targetCenter = weightedY / totalWeight;
      const nodeHeight = node.y1 - node.y0;
      const dy = (targetCenter - (node.y0 + nodeHeight / 2)) * alpha;
      node.y0 += dy;
      node.y1 += dy;
    }
    resolveCollisions(col, nodePadding, height);
  }
}

function relaxLeft(
  columns: Map<number, LayoutNode[]>,
  alpha: number,
  nodePadding: number,
  maxColumn: number,
  height: number,
) {
  for (let c = maxColumn - 1; c >= 0; c--) {
    const col = columns.get(c);
    if (!col) continue;
    for (const node of col) {
      if (node.sourceLinks.length === 0) continue;
      let weightedY = 0;
      let totalWeight = 0;
      for (const link of node.sourceLinks) {
        const targetCenter = (link.targetNode.y0 + link.targetNode.y1) / 2;
        weightedY += targetCenter * link.value;
        totalWeight += link.value;
      }
      if (totalWeight === 0) continue;
      const targetCenter = weightedY / totalWeight;
      const nodeHeight = node.y1 - node.y0;
      const dy = (targetCenter - (node.y0 + nodeHeight / 2)) * alpha;
      node.y0 += dy;
      node.y1 += dy;
    }
    resolveCollisions(col, nodePadding, height);
  }
}

function resolveCollisions(
  col: LayoutNode[],
  nodePadding: number,
  height: number,
) {
  col.sort((a, b) => a.y0 - b.y0);

  let y = 0;
  for (const node of col) {
    const dy = Math.max(0, y - node.y0);
    if (dy > 0) {
      node.y0 += dy;
      node.y1 += dy;
    }
    y = node.y1 + nodePadding;
  }

  const last = col[col.length - 1];
  const overflow = last.y1 - height;
  if (overflow > 0) {
    last.y0 -= overflow;
    last.y1 -= overflow;
    for (let i = col.length - 2; i >= 0; i--) {
      const overlap = col[i].y1 + nodePadding - col[i + 1].y0;
      if (overlap > 0) {
        col[i].y0 -= overlap;
        col[i].y1 -= overlap;
      }
    }
  }

  if (col[0].y0 < 0) {
    const shift = -col[0].y0;
    for (const node of col) {
      node.y0 += shift;
      node.y1 += shift;
    }
  }
}

function computeLinkWidthsAndOffsets(nodes: LayoutNode[]) {
  for (const node of nodes) {
    const nodeHeight = node.y1 - node.y0;
    if (node.value === 0) continue;
    const scale = nodeHeight / node.value;

    node.sourceLinks.sort((a, b) => a.targetNode.y0 - b.targetNode.y0);
    let sy = 0;
    for (const link of node.sourceLinks) {
      link.width = link.value * scale;
      link.sy = sy;
      sy += link.width;
    }

    node.targetLinks.sort((a, b) => a.sourceNode.y0 - b.sourceNode.y0);
    let ty = 0;
    for (const link of node.targetLinks) {
      link.width = link.value * scale;
      link.ty = ty;
      ty += link.width;
    }
  }
}

export function sankeyLinkPath(link: LayoutLink): string {
  const x0 = link.sourceNode.x1;
  const x1 = link.targetNode.x0;
  const y0 = link.sourceNode.y0 + link.sy + link.width / 2;
  const y1 = link.targetNode.y0 + link.ty + link.width / 2;
  const mx = (x0 + x1) / 2;
  return `M${x0},${y0} C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
}

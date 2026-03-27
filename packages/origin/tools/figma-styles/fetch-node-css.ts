// Fetches CSS properties from a Figma node via REST API

import { FIGMA_TOKEN, FigmaColor, FigmaEffect, fetchFromFigma, colorToCSS, effectsToShadowCSS } from './utils.js';

const MAX_DEPTH = 3;

if (!FIGMA_TOKEN) {
  console.error('Error: FIGMA_TOKEN not found in environment');
  process.exit(1);
}

interface FigmaPaint {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
  visible?: boolean;
  opacity?: number;
  color?: FigmaColor;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  strokeAlign?: string;
  cornerRadius?: number;
  rectangleCornerRadii?: number[];
  effects?: FigmaEffect[];
  opacity?: number;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  style?: {
    fontFamily?: string;
    fontWeight?: number;
    fontSize?: number;
    letterSpacing?: number;
    lineHeightPx?: number;
    textAlignHorizontal?: string;
  };
  children?: FigmaNode[];
}

function parseUrl(url: string): { fileKey: string; nodeId: string } | null {
  const match = url.match(/figma\.com\/design\/([^/]+).*node-id=([^&]+)/);
  if (!match) return null;
  return {
    fileKey: match[1],
    nodeId: match[2].replace('-', ':'),
  };
}

async function fetchNode(fileKey: string, nodeId: string): Promise<FigmaNode | null> {
  const data = await fetchFromFigma<{
    nodes: Record<string, { document: FigmaNode } | null>;
  }>(`/files/${fileKey}/nodes?ids=${nodeId}&geometry=paths`);
  
  return data.nodes[nodeId]?.document ?? null;
}

function fillToCSS(fills: FigmaPaint[]): string | null {
  const visible = fills.filter(f => f.visible !== false && f.type === 'SOLID');
  if (visible.length === 0) return null;
  
  const fill = visible[0];
  if (!fill.color) return null;
  return colorToCSS(fill.color, fill.opacity ?? 1);
}

const FLEX_ALIGN_MAP: Record<string, string> = {
  MIN: 'flex-start',
  CENTER: 'center',
  MAX: 'flex-end',
  SPACE_BETWEEN: 'space-between',
};

function nodeToCSS(node: FigmaNode, indent = ''): string {
  const lines: string[] = [];
  
  lines.push(`${indent}/* ${node.name} (${node.type}) */`);
  
  if (node.absoluteBoundingBox) {
    const { width, height } = node.absoluteBoundingBox;
    lines.push(`${indent}width: ${Math.round(width)}px;`);
    lines.push(`${indent}height: ${Math.round(height)}px;`);
  }

  if (node.fills && node.fills.length > 0) {
    const bg = fillToCSS(node.fills);
    if (bg) lines.push(`${indent}background-color: ${bg};`);
  }

  if (node.strokes && node.strokes.length > 0) {
    const borderColor = fillToCSS(node.strokes);
    if (borderColor && node.strokeWeight) {
      lines.push(`${indent}border: ${node.strokeWeight}px solid ${borderColor};`);
    }
  }

  if (node.cornerRadius) {
    lines.push(`${indent}border-radius: ${node.cornerRadius}px;`);
  } else if (node.rectangleCornerRadii) {
    const [tl, tr, br, bl] = node.rectangleCornerRadii;
    lines.push(`${indent}border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`);
  }

  if (node.effects && node.effects.length > 0) {
    const shadow = effectsToShadowCSS(node.effects);
    if (shadow) lines.push(`${indent}box-shadow: ${shadow};`);
  }

  if (node.opacity !== undefined && node.opacity !== 1) {
    lines.push(`${indent}opacity: ${node.opacity};`);
  }

  if (node.layoutMode && node.layoutMode !== 'NONE') {
    lines.push(`${indent}display: flex;`);
    lines.push(`${indent}flex-direction: ${node.layoutMode === 'HORIZONTAL' ? 'row' : 'column'};`);
    
    if (node.primaryAxisAlignItems) {
      lines.push(`${indent}justify-content: ${FLEX_ALIGN_MAP[node.primaryAxisAlignItems] || 'flex-start'};`);
    }
    
    if (node.counterAxisAlignItems) {
      lines.push(`${indent}align-items: ${FLEX_ALIGN_MAP[node.counterAxisAlignItems] || 'stretch'};`);
    }
    
    if (node.itemSpacing) {
      lines.push(`${indent}gap: ${node.itemSpacing}px;`);
    }
  }

  const pt = node.paddingTop ?? 0;
  const pr = node.paddingRight ?? 0;
  const pb = node.paddingBottom ?? 0;
  const pl = node.paddingLeft ?? 0;
  
  if (pt || pr || pb || pl) {
    if (pt === pr && pr === pb && pb === pl) {
      lines.push(`${indent}padding: ${pt}px;`);
    } else if (pt === pb && pl === pr) {
      lines.push(`${indent}padding: ${pt}px ${pr}px;`);
    } else {
      lines.push(`${indent}padding: ${pt}px ${pr}px ${pb}px ${pl}px;`);
    }
  }

  if (node.style) {
    const s = node.style;
    if (s.fontFamily) lines.push(`${indent}font-family: "${s.fontFamily}";`);
    if (s.fontSize) lines.push(`${indent}font-size: ${s.fontSize}px;`);
    if (s.fontWeight) lines.push(`${indent}font-weight: ${s.fontWeight};`);
    if (s.lineHeightPx) lines.push(`${indent}line-height: ${s.lineHeightPx}px;`);
    if (s.letterSpacing) lines.push(`${indent}letter-spacing: ${s.letterSpacing}px;`);
    if (s.textAlignHorizontal) {
      lines.push(`${indent}text-align: ${s.textAlignHorizontal.toLowerCase()};`);
    }
  }

  if (node.type === 'TEXT' && node.fills && node.fills.length > 0) {
    const color = fillToCSS(node.fills);
    if (color) lines.push(`${indent}color: ${color};`);
  }

  return lines.join('\n');
}

function processNodeTree(node: FigmaNode, depth = 0): string {
  const indent = '  '.repeat(depth);
  const output: string[] = [];
  
  output.push(nodeToCSS(node, indent));
  
  if (node.children && depth < MAX_DEPTH) {
    for (const child of node.children) {
      output.push('');
      output.push(processNodeTree(child, depth + 1));
    }
  }

  return output.join('\n');
}

async function main() {
  const url = process.argv[2];
  
  if (!url) {
    console.error('Usage: npm run figma:node "<figma-url>"');
    process.exit(1);
  }

  const parsed = parseUrl(url);
  if (!parsed) {
    console.error('Error: Could not parse Figma URL');
    process.exit(1);
  }

  console.log(`Fetching node ${parsed.nodeId}...\n`);

  try {
    const node = await fetchNode(parsed.fileKey, parsed.nodeId);
    
    if (!node) {
      console.error('Error: Node not found');
      process.exit(1);
    }

    console.log('='.repeat(60));
    console.log(processNodeTree(node));
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

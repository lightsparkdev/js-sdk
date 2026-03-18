// Shared utilities for Figma style fetching

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

export const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
export const FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FILE_KEY) {
  throw new Error('FIGMA_FILE_KEY not found in environment');
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible: boolean;
  color?: FigmaColor;
  offset?: { x: number; y: number };
  radius: number;
  spread?: number;
}

export async function fetchFromFigma<T>(endpoint: string): Promise<T> {
  if (!FIGMA_TOKEN) {
    throw new Error('FIGMA_TOKEN not found in environment');
  }

  const response = await fetch(`https://api.figma.com/v1${endpoint}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status}`);
  }

  return response.json();
}

export function colorToCSS(color: FigmaColor, opacity = 1): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * opacity * 100) / 100;

  if (a === 1) return `rgb(${r}, ${g}, ${b})`;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function effectsToShadowCSS(effects: FigmaEffect[]): string | null {
  const shadows = effects
    .filter(e => e.visible && (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW'))
    .map(e => {
      const inset = e.type === 'INNER_SHADOW' ? 'inset ' : '';
      const x = e.offset?.x ?? 0;
      const y = e.offset?.y ?? 0;
      const blur = e.radius;
      const spread = e.spread ?? 0;
      const color = e.color ? colorToCSS(e.color) : 'rgba(0,0,0,0.1)';

      if (spread !== 0) {
        return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
      }
      return `${inset}${x}px ${y}px ${blur}px ${color}`;
    });

  return shadows.length > 0 ? shadows.join(', ') : null;
}


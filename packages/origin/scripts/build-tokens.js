// Transforms Figma DTCG token export → SCSS variables

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../tokens/figma');
const OUTPUT_FILE = path.join(__dirname, '../src/tokens/_variables.scss');

function findTokenFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findTokenFiles(fullPath, files);
    } else if (entry.name.endsWith('.json') && !entry.name.startsWith('.')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function extractTokens(obj, prefix = '') {
  const tokens = [];
  
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    
    const tokenPath = prefix ? `${prefix}/${key}` : key;
    
    if (value && typeof value === 'object' && '$value' in value) {
      tokens.push({ name: tokenPath, value: value.$value, type: value.$type });
    } else if (value && typeof value === 'object') {
      tokens.push(...extractTokens(value, tokenPath));
    }
  }
  
  return tokens;
}

function figmaColorToCSS(colorObj) {
  if (typeof colorObj === 'string') return colorObj;
  
  if (colorObj && typeof colorObj === 'object') {
    const { components, alpha, hex } = colorObj;
    
    if (alpha >= 0.999 && hex) return hex;
    
    if (components && components.length >= 3) {
      const r = Math.round(components[0] * 255);
      const g = Math.round(components[1] * 255);
      const b = Math.round(components[2] * 255);
      const a = alpha ?? 1;
      
      if (a >= 0.999) return `rgb(${r}, ${g}, ${b})`;
      return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
    }
    
    if (hex) return hex;
  }
  
  return String(colorObj);
}

function isFontFamilyToken(name) {
  const lower = name.toLowerCase();
  return lower.includes('font-family') || lower.includes('font/family');
}

function needsPxUnits(tokenName) {
  const pxPatterns = [
    'spacing/',
    'corner-radius/',
    'stroke/',
    'font/size',
    'font/leading',
    'font/tracking',
    'max-width/',
    'screens/',
  ];
  const lower = tokenName.toLowerCase();
  return pxPatterns.some(pattern => lower.includes(pattern));
}

function quoteFontFamily(value) {
  return `"${String(value).replace(/"/g, '\\"')}"`;
}

function toCSSValue(token) {
  const { value, type, name } = token;
  
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    const ref = value.slice(1, -1).replace(/\./g, '-').replace(/\//g, '-');
    return `var(--${ref})`;
  }
  
  switch (type) {
    case 'color':
      return figmaColorToCSS(value);
    case 'dimension':
      return typeof value === 'number' ? `${value}px` : value;
    case 'number':
      return needsPxUnits(name) ? `${value}px` : String(value);
    case 'fontFamily':
      return quoteFontFamily(value);
    case 'fontWeight':
      return String(value);
    default:
      if (isFontFamilyToken(name)) return quoteFontFamily(value);
      if (typeof value === 'number' && needsPxUnits(name)) return `${value}px`;
      return String(value);
  }
}

function toVarName(tokenPath) {
  return `--${tokenPath.replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase()}`;
}

function build() {
  console.log('Building tokens from Figma export...\n');
  
  const tokenFiles = findTokenFiles(TOKENS_DIR);
  
  if (tokenFiles.length === 0) {
    console.error('Error: No token files found in', TOKENS_DIR);
    process.exit(1);
  }
  
  const baselineTokens = new Map();
  const originPrimitives = new Map();
  const lightTokens = new Map();
  const darkTokens = new Map();
  
  for (const filePath of tokenFiles) {
    const relativePath = path.relative(TOKENS_DIR, filePath);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const tokens = extractTokens(content);
    
    console.log(`  ${relativePath}: ${tokens.length} tokens`);
    
    for (const token of tokens) {
      if (relativePath.startsWith('baseline/')) {
        baselineTokens.set(token.name, token);
      } else if (relativePath.includes('Light.tokens')) {
        lightTokens.set(token.name, token);
      } else if (relativePath.includes('Dark.tokens')) {
        darkTokens.set(token.name, token);
      } else {
        originPrimitives.set(token.name, token);
      }
    }
  }
  
  let scss = `// Auto-generated — do not edit. Run: yarn tokens:build

:root {
`;

  function writeTokenGroup(tokens) {
    if (tokens.size === 0) return '';
    
    let output = '';
    for (const [name, token] of tokens) {
      const varName = toVarName(token.name);
      const value = toCSSValue(token);
      output += `  ${varName}: ${value};\n`;
    }
    return output;
  }
  
  scss += writeTokenGroup(baselineTokens);
  scss += writeTokenGroup(originPrimitives);
  scss += writeTokenGroup(lightTokens);
  
  scss += `}

[data-theme="dark"],
.dark {
`;

  for (const [name, token] of darkTokens) {
    scss += `  ${toVarName(name)}: ${toCSSValue(token)};\n`;
  }
  
  scss += `}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
`;

  for (const [name, token] of darkTokens) {
    scss += `    ${toVarName(name)}: ${toCSSValue(token)};\n`;
  }
  
  scss += `  }
}
`;

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, scss);
  
  const totalTokens = baselineTokens.size + originPrimitives.size + lightTokens.size + darkTokens.size;
  console.log(`\nGenerated ${OUTPUT_FILE}`);
  console.log(`   ${totalTokens} total tokens`);
  console.log(`   - Baseline: ${baselineTokens.size}`);
  console.log(`   - Primitives: ${originPrimitives.size}`);
  console.log(`   - Light mode: ${lightTokens.size}`);
  console.log(`   - Dark mode: ${darkTokens.size}`);
}

build();

/**
 * Patches Playwright to support SCSS/Sass/Less imports in component tests.
 *
 * Problem: Playwright's ESM loader runs Babel on ALL non-node_modules files,
 * including .scss/.sass/.less. Babel can't parse CSS preprocessor syntax,
 * causing "Support for the experimental syntax 'decorators'" errors.
 *
 * Root cause chain:
 *   1. esmLoader.js load() accepts format=null (unknown file types)
 *   2. shouldTransform() returns true for any file outside node_modules
 *   3. transformHook() runs Babel on the .scss file
 *   4. Babel interprets @use as a decorator → SyntaxError
 *
 * Fix (two patches):
 *   A. esmLoader.js: Return empty module for CSS preprocessor files before
 *      they reach Babel. Tests don't need actual CSS — just a valid export.
 *   B. tsxTransform.js: Add .scss/.sass/.less to artifactExtensions so the
 *      Babel plugin strips these imports from test files during collection.
 *
 * This runs as a postinstall script. Safe to re-run (idempotent).
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const nodeModules = join(projectRoot, 'node_modules');

const PREPROCESSOR_EXTENSIONS = ['.scss', '.sass', '.less'];
const SENTINEL = '/* patched-by-origin: css-preprocessor-support */';

// ---------------------------------------------------------------------------
// Patch A: esmLoader.js — skip CSS preprocessor files
// ---------------------------------------------------------------------------
function patchEsmLoader() {
  const loaderPath = join(nodeModules, 'playwright', 'lib', 'transform', 'esmLoader.js');
  if (!existsSync(loaderPath)) return;

  let source = readFileSync(loaderPath, 'utf8');
  if (source.includes(SENTINEL)) return; // already patched

  // Insert a guard at the top of the load() function that returns an empty
  // module for CSS preprocessor files. The guard goes right after the
  // "async function load(moduleUrl, context, defaultLoad) {" line.
  const target = 'async function load(moduleUrl, context, defaultLoad) {';
  if (!source.includes(target)) {
    console.warn('patch-playwright-ct: could not find load() in esmLoader.js — skipping');
    return;
  }

  const guard = `${target}
  ${SENTINEL}
  const _ext = moduleUrl.slice(moduleUrl.lastIndexOf('.'));
  if ([${PREPROCESSOR_EXTENSIONS.map(e => `'${e}'`).join(', ')}].includes(_ext)) {
    return { format: 'module', source: 'export default {};', shortCircuit: true };
  }`;

  source = source.replace(target, guard);
  writeFileSync(loaderPath, source, 'utf8');
  console.log('Patched playwright esmLoader.js: CSS preprocessor files return empty module');
}

// ---------------------------------------------------------------------------
// Patch B: tsxTransform.js — add preprocessor extensions to artifact set
// ---------------------------------------------------------------------------
function patchTsxTransform() {
  const transformPath = join(
    nodeModules, '@playwright', 'experimental-ct-core', 'lib', 'tsxTransform.js'
  );
  if (!existsSync(transformPath)) return;

  let source = readFileSync(transformPath, 'utf8');
  if (source.includes('.scss')) return; // already patched

  const target = '// CSS\n  ".css"';
  if (!source.includes(target)) {
    console.warn('patch-playwright-ct: could not find CSS entry in tsxTransform.js — skipping');
    return;
  }

  const replacement = '// CSS\n  ".css",\n  ".scss",\n  ".sass",\n  ".less"';
  source = source.replace(target, replacement);
  writeFileSync(transformPath, source, 'utf8');
  console.log('Patched playwright tsxTransform.js: added .scss/.sass/.less to artifactExtensions');
}

// ---------------------------------------------------------------------------
// Run both patches
// ---------------------------------------------------------------------------
patchEsmLoader();
patchTsxTransform();

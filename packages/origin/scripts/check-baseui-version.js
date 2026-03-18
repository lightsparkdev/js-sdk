#!/usr/bin/env node

/**
 * Checks if the Base UI version has changed since we last synced our utilities.
 * 
 * Usage: yarn check:baseui
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UTILS_FILE = path.join(__dirname, '../src/lib/base-ui-utils.ts');
const BASE_UI_PKG = path.join(__dirname, '../node_modules/@base-ui-components/react/package.json');

// Files we copied from Base UI
const COPIED_FILES = [
  'esm/utils/getStateAttributesProps.js',
  'esm/utils/createBaseUIEventDetails.js',
  'esm/utils/reason-parts.js',
];

function getInstalledVersion() {
  const pkg = JSON.parse(fs.readFileSync(BASE_UI_PKG, 'utf-8'));
  return pkg.version;
}

function getSyncedVersion() {
  const content = fs.readFileSync(UTILS_FILE, 'utf-8');
  const match = content.match(/@baseui-version\s+([\d.a-z-]+)/);
  return match ? match[1] : null;
}

function main() {
  const installed = getInstalledVersion();
  const synced = getSyncedVersion();

  console.log('Base UI Version Check');
  console.log('=====================');
  console.log(`Installed: ${installed}`);
  console.log(`Synced:    ${synced || 'unknown'}`);
  console.log('');

  if (installed !== synced) {
    console.log('WARNING: Version mismatch!');
    console.log('');
    console.log('Review these files for changes:');
    COPIED_FILES.forEach(file => {
      console.log(`  node_modules/@base-ui-components/react/${file}`);
    });
    console.log('');
    console.log('After syncing, update @baseui-version in src/lib/base-ui-utils.ts');
    process.exit(1);
  } else {
    console.log('OK: Versions match');
  }
}

main();

---
"@lightsparkdev/oauth": patch
---

- CJS + ESM improvements

  - Refined `package.json` exports to define both `index.js` (ESM) and `index.cjs` (CJS).
  - Added `"exports"` for Node 18+ usage.

- Type‐safety checks

  - Introduced a devDependency on `@arethetypeswrong/cli` and added a `"package-types"` script for consistent checks.

- No major functional changes
  - Focused primarily on packaging, exports, and aligning build scripts with the rest of the monorepo.

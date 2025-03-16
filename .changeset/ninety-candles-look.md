---
"@lightsparkdev/core": patch
---

- CJS + ESM improvements

  - Updated `package.json` to provide separate CommonJS (`index.cjs`) and ES modules (`index.js`).
  - Added an `exports` section to explicitly define import/require entry points.

- attw support

  - Added a `.attw.json` file and introduced a `"package-types"` script (`yarn attw --pack .`) for detecting type issues.

- Expanded currency utilities

  - Introduced `EUR` handling in `CurrencyUnit` and extended the conversion logic to accommodate more fiat/btc transformations.
  - Added new helper methods like `isUmaCurrencyAmount` and `isRecord` to strengthen type checks and conversions.
  - Updated `formatCurrencyStr()` to handle `UmaCurrencyAmount` and incorporate new format logic.

- Refined the `mapCurrencyAmount()` function and improved `formatCurrencyStr()` to handle short vs. full precision more flexibly.
- Revised sub‐paths (e.g. `./utils`) in `package.json` exports for both ESM and CJS.

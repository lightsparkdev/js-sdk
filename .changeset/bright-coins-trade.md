---
"@lightsparkdev/ui": patch
---

- **New UI components & toggles**

  - Introduced a new `MultiToggle` component (replaces or supplements the old `IconToggle`).
  - Extended the `Button` component to support new `gray`/`grayGradient` kinds and updated `forwardRef` usage for better integration.

- **CJS + ESM updates**

  - Updated `package.json` with separate `index.cjs`/`index.js` exports and refined `"exports"` to define sub‐paths for ES/cjs usage.
  - Added a `.attw.json` and a `"package-types"` script (similar to `core`) for checking type correctness.

- **Additional icons & styling**

  - Added a wide set of “central” icons (e.g. `CentralArrowLeft`, `CentralLoader`, `CentralTrashCan`, etc.).
  - Enhanced existing icons like `Satoshi` and `BitcoinB` with an optional `square` parameter.
  - Modified styling for `ButtonRow`, `DataManagerTable`, and `CardForm` to polish layout and filter UI.

- **`Link` refactor**

  - Converted internal `LinkBase` to use `forwardRef`, allowing direct refs and improved usage.
  - Added a `blue` prop for quick color overrides, plus other small accessibility improvements.

- **Other tweaks**
  - The `PhoneInput` component now supports `onBlur` and `error` props.
  - `Table` now accepts a `minHeight` prop.
  - `DataManagerTable` got a mobile-friendly filter UI (e.g., new modals for filter application and clearing).

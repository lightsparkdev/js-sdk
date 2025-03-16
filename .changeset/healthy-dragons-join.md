---
"@lightsparkdev/lightspark-sdk": minor
---

- **Bolt 12 Offer support**

  - Introduced new GraphQL mutations and objects for Bolt #12 offers:
    - `createOffer()` / `CreateOffer` GQL
    - `payOffer()` / `PayOffer` GQL
    - New `Offer`, `OfferData`, `PayOfferInput`, etc.
  - Updated `LightsparkClient` to include `createOffer()` and `payOffer()` methods (with max fees, no‐amount usage, etc.).

- **CJS + ESM reorganization**

  - Changed `package.json` main entry to `index.cjs` and refined `"exports"` to ensure correct ESM/CJS usage.
  - Added `.attw.json` and `"package-types"` script for type mismatch checks.

- **New typed objects**

  - Implemented `CurrencyAmountInput` plus expansions (e.g. `CreateOfferInput`), enabling more flexible payments.
  - Extended invoice logic for Bolt12/UMA with new fields (e.g. partial amounts, expiry times).

- **Housekeeping**
  - Minor updates for remote signing & LN usage (some expansions to the `LightsparkClient` for `payUmaInvoice`, etc.).
  - Consolidated sub‐exports to ensure consistency with the new dual‐module approach.

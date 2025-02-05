---
"@lightsparkdev/core": patch
---

- PHP Currency Support Added:
  – Updated packages/core/src/utils/currency.ts to include PHP as a valid currency unit. This involved extending the CurrencyUnit object, adding PHP conversion functions into the conversion maps (for Bitcoin, microbitcoin, millibitcoin, satoshi, etc.), and updating formatting logic (e.g. in formatCurrencyStr).
  – Corresponding type definitions and helper functions (such as isCurrencyAmountInputObj and related mapping functions) were enhanced to support PHP, and tests in packages/core/src/utils/tests/currency.test.ts now verify PHP conversions.

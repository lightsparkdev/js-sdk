---
"@lightsparkdev/core": patch
---

- Replace secp256k1 with @noble/curves: The native secp256k1 npm package (which requires native compilation/bindings) has been replaced with @noble/curves/secp256k1, a
  pure JS implementation. This removes native build dependencies, improving portability and install reliability. Secp256k1SigningKey.sign() now uses @noble/curves API
  internally (DER-encoded output is preserved).
- Add 3 new currencies: ZMW (Zambian Kwacha), AED (UAE Dirham), GTQ (Guatemalan Quetzal) — added to CurrencyUnit, conversion maps, formatting, and CurrencyMap type.

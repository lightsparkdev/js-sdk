---
"@lightsparkdev/core": patch
"@lightsparkdev/lightspark-cli": patch
"@lightsparkdev/crypto-wasm": patch
"@lightsparkdev/lightspark-sdk": patch
"@lightsparkdev/ui": patch
---

- Require Node.js `^20.19.0 || ^22.13.0 || >=24` following the upgrade to `@noble/curves` 2.4.0. Secp256k1 signing keeps the same deterministic DER-encoded signatures, and CLI key generation keeps the same key format.

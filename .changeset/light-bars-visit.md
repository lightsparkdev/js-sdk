---
"@lightsparkdev/lightspark-cli": patch
---

- Replace secp256k1 with @noble/curves: Same dependency swap — secp256k1 replaced with @noble/curves for key generation and validation. Removes native build
  requirement.

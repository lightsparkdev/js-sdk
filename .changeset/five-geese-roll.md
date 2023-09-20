---
"@lightsparkdev/lightspark-cli": patch
---

Add remote signing support
- adds option to select node for operations that use a node
- updates wasm packed lightspark_crypto lib
- uses loadNodeSigningKey to unlock/provide credentials for both OSK and remote signing nodes

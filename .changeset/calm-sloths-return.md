---
"@lightsparkdev/lightspark-cli": patch
"@lightsparkdev/lightspark-sdk": patch
"@lightsparkdev/uma": patch
---

- [uma] Add fetchPublicKeyForVasp
- [lightspark-cli] add payUmaInvoice
- [lightspark-cli] allow generate-node-keys to be used without running init-env and always asks user to choose the bitcoin network to generate the node keys
- [lightspark-cli] updates commands to get bitcoin network from the selected node in most scenarios
- [lightspark-sdk] use crypto-wasm for crypto operations
- [lightspark-sdk] dynamically import crypto-wasm for node environments only

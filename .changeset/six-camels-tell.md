---
"@lightsparkdev/lightspark-sdk": major
---

Update to latest 3P API schema
Add uma mutations
Add remote signing support
  adds enum for signing key types
  adds property to `NodeKeyCache` to save signing key type
  changes `Requester` to add signing data specific to signing key type
  adds wasm packed `lightspark_crypto` lib
  adds `loadNodeSigningKey` function to client which handles both rsa and secp key types for OSK and remote signing
  updates documentation to reflect new `loadNodeSigningKey` function
  adds `SigningKeyLoader` classes to handle loading logic
  adds option to select node for operations that use a node
  updates wasm packed lightspark_crypto lib
  BREAKING: Removes LightsparkClient's unlockNode and adds loadNodeSigningKey which should be used for loading signing keys instead

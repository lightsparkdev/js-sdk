---
"@lightsparkdev/lightspark-sdk": minor
"@lightsparkdev/wallet-sdk": minor
---

Fix json serialization of interfaces by including a toJson function for objects
- Switch interface types to `interface` instead of `type`
- Add `toJson()` to classes and `FooToJson()` to types and interfaces.

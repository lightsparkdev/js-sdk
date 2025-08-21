---
"@lightsparkdev/lightspark-sdk": patch
---

fix: wasm returned a double stringified json object where the webhook signing handler only expected it to be stringifed once. This change parses the string twice.

---
"@lightsparkdev/core": minor
---

- **Test script**
  - Renamed `test` to `test-cmd` and made `test` an alias that accepts arbitrary Jest patterns.
- **Requester**
  - Switched `wsClient` to a lazily initialized `Promise` resolved in a new `initWsClient` method.
  - Moved `autoBind` into constructor and improved cleanup/cancellation logic in `subscribe()`.
- **New tests**
  - Added `Requester.test.ts` covering query execution, error handling, subscriptions, and signing logic.
- **Errors utility**
  - Enhanced `errorToJSON` to enumerate non-enumerable props and optionally stringify nested objects.
- **LocalStorage utility**
  - Made `getLocalStorageBoolean` return `true`/`false`/`null`; `getLocalStorageConfigItem` now defaults missing keys to `false`.
- **Type guards**
  - Tightened `isObject` signature, added `isRecord`, and removed a duplicate in `types.ts`.
- **Static assets**
  - Replaced the monolithic SVG logo with an optimized, higher-resolution `lightspark-logo.svg`.

# @lightsparkdev/core

## 1.4.5

### Patch Changes

- 8fd199a: - Add USDT to supported currencies

## 1.4.4

### Patch Changes

- 031eb1b: - Resolve circular dependencies
  - React Native compatible entrypoint

## 1.4.3

### Patch Changes

- e9152bc: - Add INR support to utils/currency
  - Avoid loading graphql-ws in Bare environment due to lack of support there

## 1.4.2

### Patch Changes

- 52a274f: - Add GBP as valid CurrencyUnit
  - Add zipcodeToState util

## 1.4.1

### Patch Changes

- 7ae2525: - Remove unneeded crypto-browserify as dependency

## 1.4.0

### Minor Changes

- 5cfff96: - **Test script**
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

## 1.3.1

### Patch Changes

- b21b85e: \* Surface error name when the requester hits a graphQL error.
  - Update Turbo
  - Several small UI package improvements.

## 1.3.0

### Minor Changes

- b1f160b: - CJS + ESM improvements

  - Updated `package.json` to provide separate CommonJS (`index.cjs`) and ES modules (`index.js`).
  - Added an `exports` section to explicitly define import/require entry points.
  - attw support

    - Added a `.attw.json` file and introduced a `"package-types"` script (`yarn attw --pack .`) for detecting type issues.

  - Expanded currency utilities

    - Introduced `EUR` handling in `CurrencyUnit` and extended the conversion logic to accommodate more fiat/btc transformations.
    - Added new helper methods like `isUmaCurrencyAmount` and `isRecord` to strengthen type checks and conversions.
    - Updated `formatCurrencyStr()` to handle `UmaCurrencyAmount` and incorporate new format logic.

  - Refined the `mapCurrencyAmount()` function and improved `formatCurrencyStr()` to handle short vs. full precision more flexibly.
  - Revised sub‐paths (e.g. `./utils`) in `package.json` exports for both ESM and CJS.

## 1.2.8

### Patch Changes

- 47733a2: - Allow injecting a custom fetchImpl into the JS SDK. This is helpful for clients who need custom requesting logic, logging, etc.

## 1.2.7

### Patch Changes

- 56d359b: - PHP Currency Support Added:
  – Updated packages/core/src/utils/currency.ts to include PHP as a valid currency unit. This involved extending the CurrencyUnit object, adding PHP conversion functions into the conversion maps (for Bitcoin, microbitcoin, millibitcoin, satoshi, etc.), and updating formatting logic (e.g. in formatCurrencyStr).
  – Corresponding type definitions and helper functions (such as isCurrencyAmountInputObj and related mapping functions) were enhanced to support PHP, and tests in packages/core/src/utils/tests/currency.test.ts now verify PHP conversions.

## 1.2.6

### Patch Changes

- 80c16c1: - Bump secp256k1 from 5.0.0 to 5.0.1

## 1.2.5

### Patch Changes

- f148f37: - add RequiredKeys type utility

## 1.2.4

### Patch Changes

- 1a063b6: - Add MXN to currency conversion util
- 1a063b6: - Remove text-encoding dependency previously needed for React Native support

## 1.2.3

### Patch Changes

- d61a209: - Changes to internal use of currency utils

## 1.2.2

### Patch Changes

- 07900ac: - Upgrade deps
  - Upgrade TypeScript to 5.6.2 and some related type fixes
  - Improve clean scripts

## 1.2.1

### Patch Changes

- b43609d: - Add isObject

## 1.2.0

### Minor Changes

- c17a851: - Update types. Non-public constructObject can return null

## 1.1.0

### Minor Changes

- fda487d: - Move formatCurrencyStr options into an object (#1095)
  - Compress requests with deflate (#10512)

## 1.0.22

### Patch Changes

- baeccd9: - Improve currency functions and types

## 1.0.21

### Patch Changes

- 15d0720: - Consolidate type utils from ui to core
- 15d0720: - Use 64 bit nonces

## 1.0.20

### Patch Changes

- b47bc60: - Add lsidToUUID util

## 1.0.19

### Patch Changes

- 330f913: - Ensure tsup properly bundles ESM-only auto-bind and lodash dependencies for CJS support

## 1.0.18

### Patch Changes

- 062bf8a: [js] Add engines field to all packages to indicate supported NodeJS versions

## 1.0.17

### Patch Changes

- 20fb70b: - Update deps
  - Expose LoggingLevel

## 1.0.16

### Patch Changes

- cb28f0e: - Serialize errors that have messages but not own properties

## 1.0.15

### Patch Changes

- 66e76d3: - Remove beta headers in Requester

## 1.0.14

### Patch Changes

- b9dd0c2: Return null if !error in errorToJSON

## 1.0.13

### Patch Changes

- da1e0b2: - export secp256k1 signatures to DER format

## 1.0.12

### Patch Changes

- 35513da: Upgrade dependencies

## 1.0.11

### Patch Changes

- 43dc882: Upgrade to Typescript 5, lint config changes

## 1.0.10

### Patch Changes

- aefe52c: Update tsup to latest
- 09dfcee: Prevent ts compile of test files for builds and update lint configuration

## 1.0.9

### Patch Changes

- 0d43a39: Add common config enum for app reference

## 1.0.8

### Patch Changes

- a59d636: Remove crypto as dep - available directly in Node

## 1.0.7

### Patch Changes

- 24782f5: separateCurrencyStrParts and tests

## 1.0.6

### Patch Changes

- ffcedbe: [core] Move number utils to core
- d9f6d5b: [core] Move remaining currency utils and add tests
- baeb7a1: [core] localeToCurrencySymbol and tests

## 1.0.5

### Patch Changes

- ca58c08: Update createSha256Hash with option to return as hex string and accept string data

## 1.0.4

### Patch Changes

- 545fe1f: Switch listenToPaymentStatus to polling. Closes LIG-3588
- 545fe1f: Always enable logging in test environments

## 1.0.3

### Patch Changes

- e451948: Use AsyncStorage in wallet-sdk to check for SDK logging enabled, for ReactNative support

## 1.0.2

### Patch Changes

- 0e8767b: Add Logger for browser console and some debugging logs

## 1.0.1

### Patch Changes

- 808c77a: Consolidate some imports to lightspark-sdk and core

## 1.0.0

### Major Changes

- 1f00a50: Change SigningKey hashing method depending on environment
  BREAKING: NodeKeyCaches loadKey now requires signingKeyType as a parameter

## 0.3.11

### Patch Changes

- 4ffd9a1: Upgrade prettier, fix lint configs, move ls-react-native-crypto-app to examples

## 0.3.10

### Patch Changes

- 141d73a: Enable/fix consistent-type-imports lint rule

## 0.3.9

### Patch Changes

- 19c8513: Add lint to js packages

## 0.3.8

### Patch Changes

- 98e2511: Consolidate tsconfigs for apps and stricter rules for packages

## 0.3.7

### Patch Changes

- 4c09daf: Minor tsconfig update
  Fixes in the react native library to run with older versions of expo

## 0.3.6

### Patch Changes

- a09f51f: Allow websockets without ssl for local testing.

## 0.3.5

### Patch Changes

- c92f1d8: Force patch to sync with npm versions

## 0.3.4

### Patch Changes

- 1528704: Allow setting a protocol manually in the js sdk
- 44be15f: Add the LNURL docs for JS

## 0.3.3

### Patch Changes

- 7d81e43: Turn prettier organize imports plugin back on except for site

## 0.3.2

### Patch Changes

- cf73a38: Upgrade yarn to latest
- 9c0a2fe: Declare shared deps in workspaces that require them

## 0.3.1

### Patch Changes

- b21bf7b: Release

## 0.3.0

### Minor Changes

- d14f64e: Release

## 0.2.5

### Patch Changes

- 615bb86: Trigger release to test publish action

## 0.2.4

### Patch Changes

- 34118ba: Release

## 0.2.3

### Patch Changes

- 8bf7fe0: Patch release for core and wallet sdks.

  - Expose a function for raw subscriptions from the wallet client.
  - Fix type exports.
  - Fix a parsing bug in the wallet dashboard query

## 0.2.2

### Patch Changes

- Refactor internals to allow for a custom react native crypto implementation to be injected into the LightsparkClient.

## 0.2.1

### Patch Changes

- Update how the user agent string is passed by the requester

## 0.2.0

### Minor Changes

- Update the schema to include new wallet balances, etc.

## 0.1.7

### Patch Changes

- Cleaning up the files included in published packages

## 0.1.6

### Patch Changes

- Rename server-sdk to lightspark-sdk. It can be used from a browser.

## 0.1.5

### Patch Changes

- Fixing subscription authentication for the wallet-sdk

## 0.1.4

### Patch Changes

- Adding some helpful utilities and fixing react native compatibility.

## 0.1.3

### Patch Changes

- Shrug

## 0.1.2

### Patch Changes

- Changeset work already

## 0.1.1

### Patch Changes

- Initial release testing releases

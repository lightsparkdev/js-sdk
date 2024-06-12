# @lightsparkdev/lightspark-sdk

## 1.6.0

### Minor Changes

- 5b0016e: - Add InvoiceForPaymentHash and OutgoingPaymentsForPaymentHash
  - Regenerate SDK objects from graphql

## 1.5.14

### Patch Changes

- b855251: - Update to latest in remote signing wasm
- Updated dependencies [b855251]
  - @lightsparkdev/crypto-wasm@0.1.4

## 1.5.13

### Patch Changes

- Updated dependencies [fda487d]
  - @lightsparkdev/core@1.1.0

## 1.5.12

### Patch Changes

- a73d027: Regenerate the sdk to pick up internal payment field

## 1.5.11

### Patch Changes

- Updated dependencies [baeccd9]
  - @lightsparkdev/core@1.0.22

## 1.5.10

### Patch Changes

- Updated dependencies [15d0720]
- Updated dependencies [15d0720]
  - @lightsparkdev/core@1.0.21

## 1.5.9

### Patch Changes

- Updated dependencies [b47bc60]
  - @lightsparkdev/core@1.0.20

## 1.5.8

### Patch Changes

- 330f913: - Switch dependency placement to resolve TSUP bundling issues
- Updated dependencies [330f913]
  - @lightsparkdev/core@1.0.19

## 1.5.7

### Patch Changes

- 062bf8a: [js] Add engines field to all packages to indicate supported NodeJS versions
- Updated dependencies [062bf8a]
  - @lightsparkdev/crypto-wasm@0.1.3
  - @lightsparkdev/core@1.0.18

## 1.5.6

### Patch Changes

- Updated dependencies [20fb70b]
  - @lightsparkdev/core@1.0.17

## 1.5.5

### Patch Changes

- Updated dependencies [cb28f0e]
  - @lightsparkdev/core@1.0.16

## 1.5.4

### Patch Changes

- 66e76d3: - Regenerate GQL objects
- Updated dependencies [66e76d3]
  - @lightsparkdev/core@1.0.15

## 1.5.3

### Patch Changes

- Updated dependencies [b9dd0c2]
  - @lightsparkdev/core@1.0.14

## 1.5.2

### Patch Changes

- Updated dependencies [da1e0b2]
  - @lightsparkdev/core@1.0.13

## 1.5.1

### Patch Changes

- e77aa92: - fix runtime error in non-node environments by dynamically importing crypto-wasm for node environments

## 1.5.0

### Minor Changes

- 4c93e7f: Add withdrawal_fee_estimate to the js sdks

## 1.4.0

### Minor Changes

- b0f564d: Add the screenNode and registerPayment functions to the lightspark-sdk
- b0f564d: Add withdrawal_requests to the account and wallet object in the js sdks

## 1.3.1

### Patch Changes

- 338e641: Fix a bug in parsing a successful uma payment

## 1.3.0

### Minor Changes

- b473527: Add UMA invites functions
- b473527: Add a cancelInvoice function which cancels an unpaid invoice

### Patch Changes

- 35513da: Upgrade dependencies
- Updated dependencies [35513da]
  - @lightsparkdev/core@1.0.12

## 1.2.3

### Patch Changes

- 43dc882: Upgrade to Typescript 5, lint config changes
- Updated dependencies [43dc882]
  - @lightsparkdev/core@1.0.11

## 1.2.2

### Patch Changes

- 770386b: Regenerate JS SDK and add uma invite APIs

## 1.2.1

### Patch Changes

- aefe52c: Update tsup to latest
- 219f60f: Add descriptions and deprecation tags to JS class definitions. LIG-3794
- 09dfcee: Prevent ts compile of test files for builds and update lint configuration
- Updated dependencies [aefe52c]
- Updated dependencies [09dfcee]
  - @lightsparkdev/core@1.0.10

## 1.2.0

### Minor Changes

- 4857f66: Fix json serialization of interfaces by including a toJson function for objects
  - Switch interface types to `interface` instead of `type`
  - Add `toJson()` to classes and `FooToJson()` to types and interfaces.

## 1.1.7

### Patch Changes

- c6fceaa: Add balances to the js lightspark SDK towards LIG-3787

## 1.1.6

### Patch Changes

- Updated dependencies [0d43a39]
  - @lightsparkdev/core@1.0.9

## 1.1.5

### Patch Changes

- a59d636: Regenerate SDK objects. Add channel snapshot and payment preimage
- Updated dependencies [a59d636]
  - @lightsparkdev/core@1.0.8

## 1.1.4

### Patch Changes

- 1372f3a: Move transaction polling into new client method
- Updated dependencies [24782f5]
  - @lightsparkdev/core@1.0.7

## 1.1.3

### Patch Changes

- baeb7a1: [lightspark-sdk] Fix improper fundNode var ref and add tests
- Updated dependencies [ffcedbe]
- Updated dependencies [d9f6d5b]
- Updated dependencies [baeb7a1]
  - @lightsparkdev/core@1.0.6

## 1.1.2

### Patch Changes

- fd769cb: Fix fundNode variable reference

## 1.1.1

### Patch Changes

- e6da1d8: Add getRecentPaymentRequests

## 1.1.0

### Minor Changes

- c4926df: Change createTestModePayment to return an IncomingPayment

## 1.0.7

### Patch Changes

- e156e3e: Remote signing webhooks handler and generate latest wasm
- Updated dependencies [e156e3e]
  - @lightsparkdev/crypto-wasm@0.1.2

## 1.0.6

### Patch Changes

- ca58c08: Update createSha256Hash with option to return as hex string and accept string data
- Updated dependencies [ca58c08]
  - @lightsparkdev/core@1.0.5

## 1.0.5

### Patch Changes

- Updated dependencies [545fe1f]
- Updated dependencies [545fe1f]
  - @lightsparkdev/core@1.0.4

## 1.0.4

### Patch Changes

- Updated dependencies [e451948]
  - @lightsparkdev/core@1.0.3

## 1.0.3

### Patch Changes

- Updated dependencies [0e8767b]
- Updated dependencies [0e8767b]
  - @lightsparkdev/crypto-wasm@0.1.1
  - @lightsparkdev/core@1.0.2

## 1.0.2

### Patch Changes

- e2b1515: - [uma] Add fetchPublicKeyForVasp
  - [lightspark-cli] add payUmaInvoice
  - [lightspark-cli] allow generate-node-keys to be used without running init-env and always asks user to choose the bitcoin network to generate the node keys
  - [lightspark-cli] updates commands to get bitcoin network from the selected node in most scenarios
  - [lightspark-sdk] use crypto-wasm for crypto operations
  - [lightspark-sdk] dynamically import crypto-wasm for node environments only

## 1.0.1

### Patch Changes

- 808c77a: Consolidate some imports to lightspark-sdk and core
- Updated dependencies [808c77a]
  - @lightsparkdev/core@1.0.1

## 1.0.0

### Major Changes

- 1f00a50: Update to latest 3P API schema
  Add uma mutations
  Add remote signing support

  - adds enum for signing key types
  - adds property to NodeKeyCache to save signing key type
  - changes Requester to add signing data specific to signing key type
  - adds wasm packed lightspark_crypto lib
  - adds loadNodeSigningKey function to client which handles both rsa and secp key types for OSK and remote signing
  - updates documentation to reflect new loadNodeSigningKey function
  - updates wasm packed lightspark_crypto lib
  - BREAKING: Removes LightsparkClient unlockNode and adds loadNodeSigningKey which should be used for loading signing keys instead

### Patch Changes

- Updated dependencies [1f00a50]
  - @lightsparkdev/core@1.0.0

## 0.4.11

### Patch Changes

- 4ffd9a1: Upgrade prettier, fix lint configs, move ls-react-native-crypto-app to examples
- Updated dependencies [4ffd9a1]
  - @lightsparkdev/core@0.3.11

## 0.4.10

### Patch Changes

- 32efe27: Expose wallet transactions and invoices in the 3P schema

## 0.4.9

### Patch Changes

- 6cd80d4: Fix an issue with json deserialization for lightning fee estimates

## 0.4.8

### Patch Changes

- 141d73a: Enable/fix consistent-type-imports lint rule
- Updated dependencies [141d73a]
  - @lightsparkdev/core@0.3.10

## 0.4.7

### Patch Changes

- 19c8513: Add lint to js packages
- Updated dependencies [19c8513]
  - @lightsparkdev/core@0.3.9

## 0.4.6

### Patch Changes

- c1105d2: - Adding some remote signing capabilities to the react native crypto lib.

## 0.4.5

### Patch Changes

- 98e2511: Consolidate tsconfigs for apps and stricter rules for packages
- Updated dependencies [98e2511]
  - @lightsparkdev/core@0.3.8

## 0.4.4

### Patch Changes

- 4c09daf: Minor tsconfig update
  Fixes in the react native library to run with older versions of expo
- Updated dependencies [4c09daf]
  - @lightsparkdev/core@0.3.7

## 0.4.3

### Patch Changes

- Updated dependencies [a09f51f]
  - @lightsparkdev/core@0.3.6

## 0.4.2

### Patch Changes

- c92f1d8: Force patch to sync with npm versions
- Updated dependencies [c92f1d8]
  - @lightsparkdev/core@0.3.5

## 0.4.1

### Patch Changes

- 5e86b60: Update payment failure reason
- 44be15f: Add the LNURL docs for JS
- Updated dependencies [1528704]
- Updated dependencies [44be15f]
  - @lightsparkdev/core@0.3.4

## 0.4.0

### Minor Changes

- 7d81e43: Add createLnurlInvoice function with examples. Allows creating LNURL-pay invoices.

### Patch Changes

- 7d81e43: Turn prettier organize imports plugin back on except for site
- 7d81e43: Rerun the SDK generator to pick up several changes
- Updated dependencies [7d81e43]
  - @lightsparkdev/core@0.3.3

## 0.3.4

### Patch Changes

- 55f31db: Add walletID to relevant webhook events.

## 0.3.3

### Patch Changes

- cf73a38: Upgrade yarn to latest
- 9c0a2fe: Move typedoc into dev deps for sdks
- 9c0a2fe: Declare shared deps in workspaces that require them
- 9c0a2fe: Fix importing TextDecoder when not available
- 9c0a2fe: Fix webhook JS docs and function names
- Updated dependencies [cf73a38]
- Updated dependencies [9c0a2fe]
  - @lightsparkdev/core@0.3.2

## 0.3.2

### Patch Changes

- b28feac: Fix jwt signing key generation docs in JS
  Add webhooks support to the ts lightspark-sdk

## 0.3.1

### Patch Changes

- b21bf7b: Release
- Updated dependencies [b21bf7b]
  - @lightsparkdev/core@0.3.1

## 0.3.0

### Minor Changes

- d14f64e: Release

### Patch Changes

- Updated dependencies [d14f64e]
  - @lightsparkdev/core@0.3.0

## 0.2.8

### Patch Changes

- Updated dependencies [615bb86]
  - @lightsparkdev/core@0.2.5

## 0.2.7

### Patch Changes

- Updated dependencies [34118ba]
  - @lightsparkdev/core@0.2.4

## 0.2.6

### Patch Changes

- f2c65f3: Release
- Regenerate the SDKs and fix a circular dep in the internal-sdk (#4762)

## 0.2.5

### Patch Changes

- 9491bd4: Bumping to the newest core patch version.

## 0.2.4

### Patch Changes

- 5fb981cf8: Rename WalletDashboard to SingleNodeDashboard

## 0.2.3

### Patch Changes

- Refactor internals to allow for a custom react native crypto implementation to be injected into the LightsparkClient.
- Updated dependencies
  - @lightsparkdev/core@0.2.2

## 0.2.2

### Patch Changes

- Add bindings to lightspark-sdk for managing connected wallets.

## 0.2.1

### Patch Changes

- Update how the user agent string is passed by the requester
- Updated dependencies
  - @lightsparkdev/core@0.2.1

## 0.2.0

### Minor Changes

- Update the schema to include new wallet balances, etc.

### Patch Changes

- Updated dependencies
  - @lightsparkdev/core@0.2.0

## 0.1.7

### Patch Changes

- Cleaning up the files included in published packages
- Updated dependencies
  - @lightsparkdev/core@0.1.7

## 0.1.6

### Patch Changes

- Rename server-sdk to lightspark-sdk. It can be used from a browser.
- Updated dependencies
  - @lightsparkdev/core@0.1.6

## 0.1.5

### Patch Changes

- Fixing subscription authentication for the wallet-sdk
- Updated dependencies
  - @lightsparkdev/core@0.1.5

## 0.1.4

### Patch Changes

- Adding some helpful utilities and fixing react native compatibility.
- Updated dependencies
  - @lightsparkdev/core@0.1.4

## 0.1.3

### Patch Changes

- Shrug
- Updated dependencies
  - @lightsparkdev/core@0.1.3

## 0.1.2

### Patch Changes

- Changeset work already
- Updated dependencies
  - @lightsparkdev/core@0.1.2

## 0.1.1

### Patch Changes

- Initial release testing releases
- Updated dependencies
  - @lightsparkdev/core@0.1.1

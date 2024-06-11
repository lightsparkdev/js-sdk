# @lightsparkdev/wallet-sdk

## 0.12.13

### Patch Changes

- 5b0016e: - Add InvoiceForPaymentHash and OutgoingPaymentsForPaymentHash
  - Regenerate SDK objects from graphql

## 0.12.12

### Patch Changes

- Updated dependencies [fda487d]
  - @lightsparkdev/core@1.1.0

## 0.12.11

### Patch Changes

- a73d027: Regenerate the sdk to pick up internal payment field

## 0.12.10

### Patch Changes

- Updated dependencies [baeccd9]
  - @lightsparkdev/core@1.0.22

## 0.12.9

### Patch Changes

- Updated dependencies [15d0720]
- Updated dependencies [15d0720]
  - @lightsparkdev/core@1.0.21

## 0.12.8

### Patch Changes

- Updated dependencies [b47bc60]
  - @lightsparkdev/core@1.0.20

## 0.12.7

### Patch Changes

- 330f913: - Switch dependency placement to resolve TSUP bundling issues
- Updated dependencies [330f913]
  - @lightsparkdev/core@1.0.19

## 0.12.6

### Patch Changes

- 062bf8a: [js] Add engines field to all packages to indicate supported NodeJS versions
- Updated dependencies [062bf8a]
  - @lightsparkdev/core@1.0.18

## 0.12.5

### Patch Changes

- 20fb70b: - Allow polling for IncomingPayment completion in awaitPaymentResult and make public
- Updated dependencies [20fb70b]
  - @lightsparkdev/core@1.0.17

## 0.12.4

### Patch Changes

- Updated dependencies [cb28f0e]
  - @lightsparkdev/core@1.0.16

## 0.12.3

### Patch Changes

- Updated dependencies [66e76d3]
  - @lightsparkdev/core@1.0.15

## 0.12.2

### Patch Changes

- Updated dependencies [b9dd0c2]
  - @lightsparkdev/core@1.0.14

## 0.12.1

### Patch Changes

- Updated dependencies [da1e0b2]
  - @lightsparkdev/core@1.0.13

## 0.12.0

### Minor Changes

- e77aa92: - Rename the JwtStorage interface to AccessTokenStorage to more accurately reflect what it's storing and alleviate security concerns
  - [React native] Use SecureStorage for storing the access tokens for wallets

## 0.11.0

### Minor Changes

- 4c93e7f: Add withdrawal_fee_estimate to the js sdks

## 0.10.0

### Minor Changes

- b0f564d: Add withdrawal_requests to the account and wallet object in the js sdks

## 0.9.0

### Minor Changes

- b473527: Add a cancelInvoice function which cancels an unpaid invoice

### Patch Changes

- 35513da: Upgrade dependencies
- Updated dependencies [35513da]
  - @lightsparkdev/core@1.0.12

## 0.8.2

### Patch Changes

- 43dc882: Upgrade to Typescript 5, lint config changes
- Updated dependencies [43dc882]
  - @lightsparkdev/core@1.0.11

## 0.8.1

### Patch Changes

- aefe52c: Update tsup to latest
- 219f60f: Add descriptions and deprecation tags to JS class definitions. LIG-3794
- 09dfcee: Prevent ts compile of test files for builds and update lint configuration
- Updated dependencies [aefe52c]
- Updated dependencies [09dfcee]
  - @lightsparkdev/core@1.0.10

## 0.8.0

### Minor Changes

- 4857f66: Fix json serialization of interfaces by including a toJson function for objects
  - Switch interface types to `interface` instead of `type`
  - Add `toJson()` to classes and `FooToJson()` to types and interfaces.

## 0.7.6

### Patch Changes

- Updated dependencies [0d43a39]
  - @lightsparkdev/core@1.0.9

## 0.7.5

### Patch Changes

- a59d636: Regenerate SDK objects. Add channel snapshot and payment preimage
- Updated dependencies [a59d636]
  - @lightsparkdev/core@1.0.8

## 0.7.4

### Patch Changes

- Updated dependencies [24782f5]
  - @lightsparkdev/core@1.0.7

## 0.7.3

### Patch Changes

- Updated dependencies [ffcedbe]
- Updated dependencies [d9f6d5b]
- Updated dependencies [baeb7a1]
  - @lightsparkdev/core@1.0.6

## 0.7.2

### Patch Changes

- cda3cfb: Remove react-native as dep for now

## 0.7.1

### Patch Changes

- 59bdae3: Unpin react-native dep

## 0.7.0

### Minor Changes

- c4926df: Change createTestModePayment to return an IncomingPayment

## 0.6.25

### Patch Changes

- Updated dependencies [ca58c08]
  - @lightsparkdev/core@1.0.5

## 0.6.24

### Patch Changes

- 545fe1f: Switch listenToPaymentStatus to polling. Closes LIG-3588
- 545fe1f: Always enable logging in test environments
- Updated dependencies [545fe1f]
- Updated dependencies [545fe1f]
  - @lightsparkdev/core@1.0.4

## 0.6.23

### Patch Changes

- e451948: Use AsyncStorage in wallet-sdk to check for SDK logging enabled, for ReactNative support
- Updated dependencies [e451948]
  - @lightsparkdev/core@1.0.3

## 0.6.22

### Patch Changes

- 0e8767b: Add Logger for browser console and some debugging logs
- Updated dependencies [0e8767b]
  - @lightsparkdev/core@1.0.2

## 0.6.21

### Patch Changes

- Updated dependencies [808c77a]
  - @lightsparkdev/core@1.0.1

## 0.6.20

### Patch Changes

- 1f00a50: Update to latest 3P API schema
- Updated dependencies [1f00a50]
  - @lightsparkdev/core@1.0.0

## 0.6.19

### Patch Changes

- 4edc8fe: Return invoice instead of invoice data

## 0.6.18

### Patch Changes

- 4ffd9a1: Upgrade prettier, fix lint configs, move ls-react-native-crypto-app to examples
- Updated dependencies [4ffd9a1]
  - @lightsparkdev/core@0.3.11

## 0.6.17

### Patch Changes

- 32efe27: Expose wallet transactions and invoices in the 3P schema
- 32efe27: Add dotenv to parse env file

## 0.6.16

### Patch Changes

- 6cd80d4: Fix an issue with json deserialization for lightning fee estimates

## 0.6.15

### Patch Changes

- 565f0ab: lint:fix as part of SDK object generation

## 0.6.14

### Patch Changes

- cf11549: Add ability to set the invoice expiration in createInvoice.

## 0.6.13

### Patch Changes

- df28af1: Remove unused lightspark-cli in wallet-sdk examples

## 0.6.12

### Patch Changes

- 141d73a: Enable/fix consistent-type-imports lint rule
- Updated dependencies [141d73a]
  - @lightsparkdev/core@0.3.10

## 0.6.11

### Patch Changes

- 19c8513: Add lint to js packages
- Updated dependencies [19c8513]
  - @lightsparkdev/core@0.3.9

## 0.6.10

### Patch Changes

- 98e2511: Consolidate tsconfigs for apps and stricter rules for packages
- Updated dependencies [98e2511]
  - @lightsparkdev/core@0.3.8

## 0.6.9

### Patch Changes

- 4c09daf: Minor tsconfig update
  Fixes in the react native library to run with older versions of expo
- Updated dependencies [4c09daf]
  - @lightsparkdev/core@0.3.7

## 0.6.8

### Patch Changes

- Updated dependencies [a09f51f]
  - @lightsparkdev/core@0.3.6

## 0.6.7

### Patch Changes

- 664f18d: Remove signing key requirement for createBitcoinFundingAddress. It is not needed.

## 0.6.6

### Patch Changes

- c92f1d8: Force patch to sync with npm versions
- Updated dependencies [c92f1d8]
  - @lightsparkdev/core@0.3.5

## 0.6.5

### Patch Changes

- 5e86b60: Update payment failure reason
- 5e86b60: Adding a developer test helper for webhooks.
- 1528704: Allow setting a protocol manually in the js sdk
- 44be15f: Add the LNURL docs for JS
- 828f234: Fix the types when parsing JS walletDashboards
- Updated dependencies [1528704]
- Updated dependencies [44be15f]
  - @lightsparkdev/core@0.3.4

## 0.6.4

### Patch Changes

- 7d81e43: Turn prettier organize imports plugin back on except for site
- 7d81e43: Rerun the SDK generator to pick up several changes
- Updated dependencies [7d81e43]
  - @lightsparkdev/core@0.3.3

## 0.6.3

### Patch Changes

- cf73a38: Upgrade yarn to latest
- 9c0a2fe: Move typedoc into dev deps for sdks
- 9c0a2fe: Declare shared deps in workspaces that require them
- Updated dependencies [cf73a38]
- Updated dependencies [9c0a2fe]
  - @lightsparkdev/core@0.3.2

## 0.6.2

### Patch Changes

- b28feac: Fix jwt signing key generation docs in JS
  Add webhooks support to the ts lightspark-sdk

## 0.6.1

### Patch Changes

- Updated dependencies [b21bf7b]
  - @lightsparkdev/core@0.3.1

## 0.6.0

### Minor Changes

- d14f64e: Release

### Patch Changes

- Updated dependencies [d14f64e]
  - @lightsparkdev/core@0.3.0

## 0.5.5

### Patch Changes

- Updated dependencies [615bb86]
  - @lightsparkdev/core@0.2.5

## 0.5.4

### Patch Changes

- Updated dependencies [34118ba]
  - @lightsparkdev/core@0.2.4

## 0.5.3

### Patch Changes

- f2c65f3: Release
- Regenerate the SDKs and fix a circular dep in the internal-sdk (#4762)

## 0.5.2

### Patch Changes

- 8bf7fe0: Patch release for core and wallet sdks.

  - Expose a function for raw subscriptions from the wallet client.
  - Fix type exports.
  - Fix a parsing bug in the wallet dashboard query

- Updated dependencies [8bf7fe0]
  - @lightsparkdev/core@0.2.3

## 0.5.1

### Patch Changes

- Include channel opening and closing transactions

## 0.5.0

### Minor Changes

- Require signing on the initialize wallet operation to allow channels to be created.

## 0.4.1

### Patch Changes

- Fix a bug in the request_withrawal mutation.

## 0.4.0

### Minor Changes

- Add helper functions for awaiting outgoing payment results

## 0.3.6

### Patch Changes

- OK last amount_msats fix, I swear...

## 0.3.5

### Patch Changes

- One more amount_msats cleanup

## 0.3.4

### Patch Changes

- CI error caused the previous patch to not actually pick up the fix.

## 0.3.3

### Patch Changes

- Fix in encoding the amount_msats when it's undefined.

## 0.3.2

### Patch Changes

- Refactor internals to allow for a custom react native crypto implementation to be injected into the LightsparkClient.
- Updated dependencies
  - @lightsparkdev/core@0.2.2

## 0.3.1

### Patch Changes

- Point wallet sdk at the versioned schema (2023-05-05).

## 0.3.0

### Minor Changes

- Update SDK schemas to remove the L1/L2 balances

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

## 0.1.8

### Patch Changes

- Update included files for the wallet-sdk package

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

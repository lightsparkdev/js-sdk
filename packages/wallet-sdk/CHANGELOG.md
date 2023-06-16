# @lightsparkdev/wallet-sdk

## 0.6.5

### Patch Changes

- 44be15f: Add the LNURL docs for JS
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

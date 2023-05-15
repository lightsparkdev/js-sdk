# @lightsparkdev/react-wallet

## 0.5.1

### Patch Changes

- Include channel opening and closing transactions
- Updated dependencies
  - @lightsparkdev/wallet-sdk@0.5.1

## 0.5.0

### Minor Changes

- Require signing on the initialize wallet operation to allow channels to be created.

### Patch Changes

- Updated dependencies
  - @lightsparkdev/wallet-sdk@0.5.0

## 0.4.1

### Patch Changes

- Fix a bug in the request_withrawal mutation.
- Updated dependencies
  - @lightsparkdev/wallet-sdk@0.4.1

## 0.4.0

### Minor Changes

- Add helper functions for awaiting outgoing payment results

### Patch Changes

- Updated dependencies
  - @lightsparkdev/wallet-sdk@0.4.0

## 0.3.6

### Patch Changes

- OK last amount_msats fix, I swear...
- Updated dependencies
  - @lightsparkdev/wallet-sdk@0.3.6

## 0.3.5

### Patch Changes

- One more amount_msats cleanup
- Updated dependencies
  - @lightsparkdev/wallet-sdk@0.3.5

## 0.3.4

### Patch Changes

- CI error caused the previous patch to not actually pick up the fix.
- Updated dependencies
  - @lightsparkdev/wallet-sdk@0.3.4

## 0.3.3

### Patch Changes

- Fixing encoding of amount_msats when undefined

## 0.3.2

### Patch Changes

- Refactor internals to allow for a custom react native crypto implementation to be injected into the LightsparkClient.
- Updated dependencies
  - @lightsparkdev/core@0.2.2
  - @lightsparkdev/wallet-sdk@0.3.2

## 0.3.1

### Patch Changes

- Point wallet sdk at the versioned schema (2023-05-05).
- Updated dependencies
  - @lightsparkdev/wallet-sdk@0.3.1

## 0.3.0

### Minor Changes

- Update SDK schemas to remove the L1/L2 balances

### Patch Changes

- Updated dependencies
  - @lightsparkdev/wallet-sdk@0.3.0

## 0.2.0

### Minor Changes

- Update the schema to include new wallet balances, etc.

### Patch Changes

- Updated dependencies
  - @lightsparkdev/core@0.2.0
  - @lightsparkdev/wallet-sdk@0.2.0

## 0.1.7

### Patch Changes

- Cleaning up the files included in published packages
- Updated dependencies
  - @lightsparkdev/core@0.1.7
  - @lightsparkdev/wallet-sdk@0.1.7

## 0.1.6

### Patch Changes

- Rename server-sdk to lightspark-sdk. It can be used from a browser.
- Updated dependencies
  - @lightsparkdev/core@0.1.6
  - @lightsparkdev/wallet-sdk@0.1.6

## 0.1.5

### Patch Changes

- Fixing subscription authentication for the wallet-sdk
- Updated dependencies
  - @lightsparkdev/core@0.1.5
  - @lightsparkdev/wallet-sdk@0.1.5

## 0.1.4

### Patch Changes

- Adding some helpful utilities and fixing react native compatibility.
- Updated dependencies
  - @lightsparkdev/core@0.1.4
  - @lightsparkdev/wallet-sdk@0.1.4

## 0.1.3

### Patch Changes

- Shrug
- Updated dependencies
  - @lightsparkdev/core@0.1.3
  - @lightsparkdev/wallet-sdk@0.1.3

## 0.1.2

### Patch Changes

- Changeset work already
- Updated dependencies
  - @lightsparkdev/wallet-sdk@0.1.2
  - @lightsparkdev/core@0.1.2

## 0.1.1

### Patch Changes

- Initial release testing releases
- Updated dependencies
  - @lightsparkdev/core@0.1.1
  - @lightsparkdev/wallet-sdk@0.1.1

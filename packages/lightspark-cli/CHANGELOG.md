# @lightsparkdev/lightspark-cli

## 0.0.20

### Patch Changes

- Updated dependencies [c4926df]
  - @lightsparkdev/lightspark-sdk@1.1.0

## 0.0.19

### Patch Changes

- e156e3e: Remote signing webhooks handler and generate latest wasm
- e156e3e: Fix import
- Updated dependencies [e156e3e]
  - @lightsparkdev/lightspark-sdk@1.0.7
  - @lightsparkdev/crypto-wasm@0.1.2

## 0.0.18

### Patch Changes

- Updated dependencies [ca58c08]
  - @lightsparkdev/lightspark-sdk@1.0.6
  - @lightsparkdev/core@1.0.5

## 0.0.17

### Patch Changes

- Updated dependencies [545fe1f]
- Updated dependencies [545fe1f]
  - @lightsparkdev/core@1.0.4
  - @lightsparkdev/lightspark-sdk@1.0.5

## 0.0.16

### Patch Changes

- Updated dependencies [e451948]
  - @lightsparkdev/core@1.0.3
  - @lightsparkdev/lightspark-sdk@1.0.4

## 0.0.15

### Patch Changes

- Updated dependencies [0e8767b]
- Updated dependencies [0e8767b]
  - @lightsparkdev/crypto-wasm@0.1.1
  - @lightsparkdev/core@1.0.2
  - @lightsparkdev/lightspark-sdk@1.0.3

## 0.0.14

### Patch Changes

- e2b1515: - [uma] Add fetchPublicKeyForVasp
  - [lightspark-cli] add payUmaInvoice
  - [lightspark-cli] allow generate-node-keys to be used without running init-env and always asks user to choose the bitcoin network to generate the node keys
  - [lightspark-cli] updates commands to get bitcoin network from the selected node in most scenarios
  - [lightspark-sdk] use crypto-wasm for crypto operations
  - [lightspark-sdk] dynamically import crypto-wasm for node environments only
- Updated dependencies [e2b1515]
  - @lightsparkdev/lightspark-sdk@1.0.2

## 0.0.13

### Patch Changes

- 808c77a: Consolidate some imports to lightspark-sdk and core
- Updated dependencies [808c77a]
  - @lightsparkdev/lightspark-sdk@1.0.1
  - @lightsparkdev/core@1.0.1

## 0.0.12

### Patch Changes

- 1f00a50: Add remote signing support
  - adds option to select node for operations that use a node
  - updates wasm packed lightspark_crypto lib
  - uses loadNodeSigningKey to unlock/provide credentials for both OSK and remote signing nodes
- Updated dependencies [1f00a50]
- Updated dependencies [1f00a50]
  - @lightsparkdev/core@1.0.0
  - @lightsparkdev/lightspark-sdk@1.0.0

## 0.0.11

### Patch Changes

- c3c779f: Add generate-secp256k1-keypair command

## 0.0.10

### Patch Changes

- 4ffd9a1: Upgrade prettier, fix lint configs, move ls-react-native-crypto-app to examples
- Updated dependencies [4ffd9a1]
  - @lightsparkdev/lightspark-sdk@0.4.11
  - @lightsparkdev/core@0.3.11

## 0.0.9

### Patch Changes

- 32efe27: Add dotenv to parse env file
- Updated dependencies [32efe27]
  - @lightsparkdev/lightspark-sdk@0.4.10

## 0.0.8

### Patch Changes

- 451b106: Output hex-encoded seed in generate-node-keys command

## 0.0.7

### Patch Changes

- 5bf68c1: Fix parsing of webhook subevent type
- 5bf68c1: Automatically find bitcoin network for provided api token
- Updated dependencies [6cd80d4]
  - @lightsparkdev/lightspark-sdk@0.4.9

## 0.0.6

### Patch Changes

- 88a8994: Fix version retrieval for global installs

## 0.0.5

### Patch Changes

- 0b71a9c: Add generate-node-key command

## 0.0.4

### Patch Changes

- 565f0ab: Fix tsconfigs for CLIs to ensure builds output to dist

## 0.0.3

### Patch Changes

- cf11549: Add ability to set the invoice expiration in createInvoice.

## 0.0.2

### Patch Changes

- 7423c87: Empty change to trigger version

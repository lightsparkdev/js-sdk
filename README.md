# Lightspark JS/TS SDKs

This repository contains all of the Lightspark Javascript/Typescript SDKs. The SDKs are organized into the following packages:

- [lightspark-sdk](./packages/lightspark-sdk/README.md): A high-level management SDK that can be used from a node or browser environment. It's used to manage accounts, nodes, wallets, etc. and should be authenticated via API token or OAuth.
- [wallet-sdk](./packages/wallet-sdk/README.md): A client-side wallet SDK, which can be used from a browser or React Native environment. It's meant to interact with a single wallet user.
- [react-wallet](./packages/react-wallet/README.md): A React library that wraps the wallet SDK and provides some convenient React hooks.
- [oauth](./packages/oauth/README.md): A client-side OAuth library, which can be used from a browser or React Native environment. This library currently only authenticates lightspark administrator accounts, not wallet users. _Note_: This package is currently in unpublished beta, and is subject to change.

Check out the READMEs for each package for more information on how to use them, or see the `examples` directory in each package for sample use cases.

TODO

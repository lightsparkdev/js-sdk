# Lightspark JS/TS SDKs

This repository contains all of the Lightspark Javascript/Typescript SDKs. The SDKs are organized into the following packages:

- [lightspark-sdk](./packages/lightspark-sdk/README.md): A high-level management SDK that can be used from a node or browser environment. It's used to manage accounts, nodes, wallets, etc. and should be authenticated via API token or OAuth.
- [oauth](./packages/oauth/README.md): A client-side OAuth library, which can be used from a browser or React Native environment. This library currently only authenticates lightspark administrator accounts, not wallet users. _Note_: This package is currently in unpublished beta, and is subject to change.

## Running the SDKs and examples

Most of our SDK packages are available on [npm under @lightsparkdev](https://www.npmjs.com/search?q=%40lightsparkdev). We have a number of example apps also available in this repository that you may run directly. To do so we recommend using a version of [Node >= LTS](https://nodejs.dev/en/about/releases/) and Yarn v3. With Node you can easily install and enable the correct yarn version by running the following:

```
git clone git@github.com:lightsparkdev/js-sdk.git
cd js-sdk
corepack enable
corepack prepare --activate
yarn
```

This will install the proper version of yarn and all dependencies for the Lightspark js-sdk workspaces.

Then to build dependencies and run a specific example - get the package.json name from the example directory, removing the @lightsparkdev/ portion, and pass as an argument to `yarn start` from the repo root. For example for @lightsparkdev/remote-signing-server:

```
yarn start remote-signing-server
```

Please see the README files in the [examples directory](./apps/examples) for instructions on running the examples. Please note that some packages such as @lightsparkdev/ui are for building the examples only and not necessary for your implementation of our [published SDK packages](https://www.npmjs.com/search?q=%40lightsparkdev).

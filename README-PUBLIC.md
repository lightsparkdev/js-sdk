# Lightspark JS/TS SDKs

This repository contains all of the Lightspark Javascript/Typescript SDKs. The SDKs are organized into the following packages:

- [lightspark-sdk](./packages/lightspark-sdk/README.md): A high-level management SDK that can be used from a node or browser environment. It's used to manage accounts, nodes, wallets, etc. and should be authenticated via API token or OAuth.
- [wallet-sdk](./packages/wallet-sdk/README.md): A client-side wallet SDK, which can be used from a browser or React Native environment. It's meant to interact with a single wallet user.
- [react-wallet](./packages/react-wallet/README.md): A React library that wraps the wallet SDK and provides some convenient React hooks.
- [oauth](./packages/oauth/README.md): A client-side OAuth library, which can be used from a browser or React Native environment. This library currently only authenticates lightspark administrator accounts, not wallet users. _Note_: This package is currently in unpublished beta, and is subject to change.

Check out the READMEs for each package for more information on how to use them, or see the `examples` directory in each package for sample use cases.

# Releases

TODO: Add release instructions.

# Changesets

We're using Turbo and workspaces in combination with changesets to manage and build the packages. Currently this is a local manual process and the steps are as follows:

```
yarn
# make some changes to one of the packages
yarn build
```

At this point depending on what you do the changesets command may or may not pick up changes automatically. It compares relative to the ref specified in .changeset/json.config (see [these lines](https://github.com/changesets/changesets/blob/main/packages/cli/src/commands/add/index.ts#L42-L46)) which is different from how e.g. the `yarn changesets status --since=some-ref` behaves. So if you know for sure you want to publish new versions as a result of your current uncommitted working tree you may do that, otherwise you'll have to manually pick the packages that have changed when it asks you.

```
yarn changeset
git commit -nm 'Changeset for [package]'
yarn changeset version
git commit -nm 'Version for [package]'
yarn changeset publish
```

Once changesets is integrated into CI the diffs will work more automatically since they'll be running on every commit, but this needs more investigation. Ideally CI would autopublish patches on changes or larger version bumps if specified.

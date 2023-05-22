# Lightspark javascript workspaces

This directory contains public and private javascript projects that are managed with yarn workspaces. Public packages like the Lighspark SDK and Wallet SDK that are published to npm are under the packages directory. Public apps such as the docs website or SDK integration example apps are under the apps directory. In both of these directories there is a `private` subdirectory that includes code that should not be public, such as our product and operations websites in apps/private and internal utilities in packages/private. We use Turbo and follow [guidelines there](https://turbo.build/repo/docs/handbook/workspaces#configuring-workspaces) for deciding what is an app and a package. In general if something can be published and incorporated as a dependency in either public or private npm repositories it is a package. Apps are things like websites and extensions that consume those packages and code would not make sense as dependencies for other projects.

# Release for public packages

You can make changes to public Lightspark packages and SDKs from this repo/directory and they will be automatically copied to the public repo. The process for making changes and releasing are as follows:

1. Commit changes to webdev main branch, triggering the Copybara action to the public repo
2. From the public repo a new Release PR will be opened or an existing one will be updated with the changes from webdev
3. Add a changeset using the changeset bot that comments automatically on the Release PR.

## Changesets

We're using changesets to manage package updates in the public repo. It's useful to automatically rebuild, version, and publish our packages when they change OR a change is made to one of our packages that it depends on. Changesets has configuration options that change its behavior in very subtle ways and we've done some testing to find the right configuration.

## Keep internal dependencies pinned

For example ensuring the internal dependency is specified "1.0.0" instead of "^1.0.0" in package.json. This is one of the best ways to ensure changesets behaves in a predictable way. For example, take react-wallet package which depends on wallet-sdk at verison 1.0.0:

- wallet-sdk has a change that developer decides should result in a patch upgrade to wallet-sdk (by adding a patch changeset bump on the automatic Release PR)
  &#x2612; @lightpsarkdev/wallet-sdk: "^1.0.0" -> "^1.0.0" No change, so react-wallet is not rebuilt and published
  &#x2611; @lightpsarkdev/wallet-sdk: "1.0.1": react-wallet version is patched which triggers a rebuild and publish in changesets

- wallet-sdk has a change that developer decides should result in a minor upgrade to wallet-sdk (by adding a minor changeset bump on the automatic Release PR)
  &#x2612; @lightpsarkdev/wallet-sdk: "^1.0.0" -> "^1.0.0" No change, so react-wallet is not rebuilt and published
  &#x2611; @lightpsarkdev/wallet-sdk: "1.0.1": react-wallet version is patched which triggers a rebuild and publish in changesets

Notice that it doesn't matter whether wallet-sdk is patch or minor bumped, it results in a patch to react-wallet in both cases.

## Linked and fixed packages

After testing several different combinations of these it seems neither of these options lead to more predictable results than simply pinning the dependencies. Both of the options bump all of the versions for affected packages to the same min version, so for example if react-wallet is at 0.0.1 and wallet-sdk is bumped to 2.0.0 then react-wallet will also bump to 2.0.0. It's not necessarily always the case that we'd want to force people to upgrade to a major version for react-wallet here. Pinning the dependencies makes more sense because it's A. guarenteed to result in a new version and B. still gives us the flexibility to override and upgrade react-wallet to a higher version if necessary.

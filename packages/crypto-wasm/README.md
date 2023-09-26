# @lightsparkdev/crypto-wasm

A shared library for crypto operations in Lightspark's SDKs.

Generated via wasm-packing lightspark-crypto-uniffi.

Currently only can be used in Node environments, so if you are using this in Lightspark SDK, make sure to only import using [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) after checking the environment.

## Updating this package

Running the `sync.sh` script will wasm-pack the lightspark-crypto-uniffi lib and copy over the files to this package.

### Pre-requisite for running the update

1. Clone [webdev](https://github.com/lightsparkdev/webdev) into `~/src`.
2. Clone [lightspark-crypto-uniffi](https://github.com/lightsparkdev/lightspark-crypto-uniffi) into `~/src`.
3. Install [rust](https://www.rust-lang.org/tools/install) and [wasm-pack](https://formulae.brew.sh/formula/wasm-pack). Note rustup is recommended instead of homebrew for installing rust - homebrew requires extra configuration that is [not guarenteed to work](https://rustwasm.github.io/wasm-pack/book/prerequisites/non-rustup-setups.html#manually-add-wasm32-unknown-unknown) for all configurations.
4. `cd ~/src/lightspark-crypto-uniffi && cargo install --path .`

> ⚠️ If you are using an M1 chip macbook, you will need to [run the x86_64 toolchain](https://github.com/rust-bitcoin/rust-secp256k1/issues/283):

```
# Note - this is going to install and use a separate instance of homebrew than you probably already have installed that installs into /usr/local/bin instead of /opt/homebrew/bin. For M1 macs the default is /opt/homebrew/bin - read more about why this is necessary [here](https://earthly.dev/blog/homebrew-on-m1/).
arch -x86_64 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
arch -x86_64 /usr/local/bin/brew install llvm
export PATH="/usr/local/opt/llvm/bin:$PATH" # add this to your shell profile too so it's sourced automatically
```

### Building for wasm

```
yarn build
```

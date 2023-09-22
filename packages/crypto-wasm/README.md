# @lightsparkdev/crypto-wasm
A shared library for crypto operations in Lightspark's SDks.

Generated via wasm-packing lightspark-crypto-uniffi.

Currently only can be used in Node environments, so if you are using this in Lightspark SDK, make sure to only import using [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) after checking the environment.

## Updating this package

Running the `sync.sh` script will wasm-pack the lightspark-crypto-uniffi lib and copy over the files to this package.

### Pre-requisite for running the update

1. Clone [webdev](https://github.com/lightsparkdev/webdev) into `~/src`.
1. Clone [lightspark-crypto-uniffi](https://github.com/lightsparkdev/lightspark-crypto-uniffi) into `~/src`.
1. Install [rust](https://formulae.brew.sh/formula/rust) and [wasm-pack](https://formulae.brew.sh/formula/wasm-pack).

### Running the script

```
sh sync.sh
```

> ⚠️ If you are using an M1 chip macbook, you will need to [run the x86_64 toolchain](https://github.com/rust-bitcoin/rust-secp256k1/issues/283).

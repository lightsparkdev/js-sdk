#!/bin/bash

cd ../../../../lightspark-crypto-uniffi
wasm-pack build --target nodejs --out-name crypto

wasm_files[0]="crypto.d.ts"
wasm_files[1]="crypto.js"
wasm_files[2]="crypto_bg.wasm"
wasm_files[3]="crypto_bg.wasm.d.ts"

for i in ${wasm_files[@]}; do
    yes | cp -rf ./pkg/$i ../webdev/js/packages/crypto-wasm/
done

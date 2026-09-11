#!/bin/bash

cd ../../../../lightspark-crypto-uniffi || exit
wasm-pack build --target nodejs --out-name crypto

wasm_files[0]="crypto.d.ts"
wasm_files[1]="crypto.js"
wasm_files[2]="crypto_bg.wasm"
wasm_files[3]="crypto_bg.wasm.d.ts"

destination="../webdev/js/packages/crypto-wasm/"

for i in "${wasm_files[@]}"; do
    if [ "$i" == "crypto.js" ]; then
        # rename for proper cjs exports:
        cp -rf "./pkg/$i" "${destination}crypto.cjs"
    else
        cp -rf "./pkg/$i" "${destination}$i"
    fi
done

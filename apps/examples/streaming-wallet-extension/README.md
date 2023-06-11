# Lightspark Streaming Wallet Extension

A simple demo Lightning wallet from Lightspark that demonstrates the power of streaming bitcoin while watching a video.

Navigate to "https://app.lightspark.com/demos/streaming" to try it out!

## Building

Run `yarn && yarn run build` from js-sdk root directory. It will output the compiled source to the `packages/apps/examples/streaming-wallet-extension/build`
directory.

## Installing from source

After building from source, navigate to `chrome://extensions` in Chrome and enable developer mode. Then click
"Load unpacked" and select the `streaming-wallet-extension/build` directory.

# Lightspark Streaming Wallet Extension

A simple demo Lightning wallet from Lightspark that demonstrates the power of streaming bitcoin while watching a video.

Navigate to "https://app.lightspark.com/demos/streaming" to try it out!

## Building

First build the JS sdk by running `npm install` then `npm run build` in the root of the js-sdk directory.

Then run those same commands in this directory to build the extension. It will output the compiled source to the `build`
directory.

## Installing from source

After building from source, navigate to `chrome://extensions` in Chrome and enable developer mode. Then click
"Load unpacked" and select the `streaming-wallet-extension/build` directory.

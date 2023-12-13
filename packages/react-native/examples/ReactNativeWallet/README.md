# React Native Wallet Example

## Getting started

1. Follow the [instructions](https://github.com/lightsparkdev/js-sdk#running-the-sdks-and-examples) on setting up the js-sdk workspace to run these examples locally.
2. Run the [demo JWT Server](https://github.com/lightsparkdev/js-sdk/tree/main/apps/examples/jwt-server).

### Running on iOS

First install deps:

```bash
npx expo install
```

Then prebuild the ios target:

```bash
npx expo prebuild -p ios
```

Then run it!

```bash
npx expo run:ios
```

### Issues running on iOS

- "Xcode must be fully installed before you can continue". See https://github.com/expo/expo/issues/21727 for suggested fix `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`

### General issues

- "Duplicated files or mocks" runtime error. Please delete packages/tsconfig/dist if it exists.

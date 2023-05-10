# The Lightspark JS+TS React Native Utility package

This package offers utilities and alternative implementations of some core Lightspark SDK interfaces to add compatibility with react-native. It can be imported in addition to the `@lightsparkdev/wallet-sdk` or `lightsparkdev/react-wallet` packages to add react-native support.

## Getting started

To use the package, you'll need to install it from npm:

```bash
$ npm install @lightsparkdev/react-native
```

### Crypto

By default the Lightspark SDKs' crypto implementation does not work on React Native. To use the react-native crypto implementation, you'll need to import this package and set it as the default crypto implementation when constructing your LightsparkClient instance:

```typescript
import { LightsparkClient } from "@lightsparkdev/wallet-sdk";

// Import the react-native crypto implementation.
import { ReactNativeCrypto } from "@lightsparkdev/react-native";

// Set the crypto implementation when constructing the client.
const lightsparkClient = new LightsparkClient(
  /* authProvider */ undefined,
  /* serverUrl */ undefined,
  /* cryptoImpl */ ReactNativeCrypto
);
```

Alternatively, if you're using the `lightsparkdev/react-wallet` package, you can set the crypto implementation when constructing the `LightsparkClientProvider`:

```typescript
import { ReactNativeCrypto } from "@lightsparkdev/react-native";
import {
  JwtAuthProvider,
  LightsparkClientProvider,
} from "@lightsparkdev/react-wallet";
import PageContainer from "./PageContainer";

export default function App() {
  return (
    <LightsparkClientProvider customCryptoImpl={ReactNativeCrypto}>
      <JwtAuthProvider useLocalStorage>
        <PageContainer />
      </JwtAuthProvider>
    </LightsparkClientProvider>
  );
}
```

See [examples/ReactNativeWallet](./examples/ReactNativeWallet) for a full example of how to use this package with `lightsparkdev/react-wallet`.

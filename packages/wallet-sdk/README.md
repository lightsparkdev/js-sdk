# The Lightspark JS+TS Wallet SDK

![npm (scoped)](https://img.shields.io/npm/v/@lightsparkdev/wallet-sdk)

This is the Lightspark Typescript Wallet SDK, which can be used from a browser or React Native environment. See the examples directory for some examples of how to use it! If you're using this SDK with React, you might also want to check out our [react-wallet](../react-wallet/README.md) library, which wraps this SDK and provides some convenient React hooks.

## Getting started

To use the SDK, you'll need to install it from npm:

```bash
$ npm install @lightsparkdev/wallet-sdk
```

The first step is to create a LightsparkClient object, which is the main interaction point with the wallet sdk.

```typescript
import { LightsparkClient } from "@lightsparkdev/wallet-sdk";

const client = new LightsparkClient();
```

### Authentication via JWT

The current version of the SDK supports JWT authentication, which is intended for client-side use. To authenticate, you'll need to login using your lightspark account ID and
a JWT allocated for the user by your own server.

![jwt diagram](./docs-media/jwt-diagram.png)

First, you'll need to register your account public key with Lightspark. You can do this from the [Lightspark Account Settings page](https://app.lightspark.com/account#security). You'll need to provide the public key for the account you want to use to sign JWTs. You can manually generate a keypair using the _ES256_ algorithm, or install and use our [Wallet CLI](https://docs.lightspark.com/wallet-sdk/wallet-cli?language=Typescript) which can generate a new keypair for you:

```bash
lightspark-wallet init-env
```

This will prompt you for your account ID and generate a JWT signing keypair that is stored in an env file:

```bash
cat ~/.lightsparkenv
```

You can then copy the contents of the public key file into the "JWT Public Key" field on the API Tokens page. You'll also want to copy the private key into your server code (or rather in secret keystore or environment variable), so that you can use it to sign JWTs.

Next, you'll need to create a JWT for the user. You should expose an endpoint from your backend to create these tokens. For example, to create a JWT from a typescript+node server:

```typescript
import * as jwt from "jsonwebtoken";

// Create a JSON object that contains the claims for your JWT.
const claims = {
  aud: "https://api.lightspark.com",
  // Any unique identifier for the user.
  sub: "511c7eb8-9afe-4f69-989a-8d1113a33f3d",
  // True to use the test environment, false to use the production environment.
  test: true,
  iat: 1516239022,
  // Expriation time for the JWT.
  exp: 1799393363,
};

// Call the `sign()` method on the `jsonwebtoken` library, passing in the JSON object and your private key.
const token = jwt.sign(claims, "your private key");

// Now send the token back to the client so that they can use it to authenticate with the Lightspark SDK.
```

Now on the client, you can login using the JWT and your company's account ID from the account settings page:

```typescript
await client.loginWithJWT(ACCOUNT_ID, jwt, new LocalStorageJwtStorage());
```

You'll notice that this request takes a parameter which is an implementation of JwtStorage. This can be used to save credentials for the next time the app starts up. If you want to recover wallet credentials using saved JWT info, you can pass a JWT storage implementation to the client constructor. For example, if you've previously logged in using a `LocalStorageJwtStorage` implementation, you can recover the credentials at app startup like so:

```typescript
import {
  LightsparkClient,
  LocalStorageJwtStorage,
  CustomJwtAuthProvider,
} from "@lightsparkdev/wallet-sdk";

const jwtStorage = new LocalStorageJwtStorage();
const client = new LightsparkClient(new CustomJwtAuthProvider(jwtStorage));
```

### Deploying and initializing a wallet

![wallet state diagram](./docs-media/wallet-state-diagram.png)

When a user logs in for the first time, initially, their wallet will be in a `NOT_SETUP` status. You can identify this status by querying the current wallet:

```typescript
const wallet = await client.getCurrentWallet();
if (wallet.status === WalletStatus.NOT_SETUP) {
  // The wallet is not setup, so we need to deploy it.
}
```

To deploy the wallet, you'll need to call `client.deployWallet()` and then wait for the wallet's status to update to the DEPLOYED or FAILED status. You can do this either by polling the wallet, or by subscribing to wallet updates via the helper function which subscribes to status updates.

Here's an example which polls wallet state every 2 seconds:

```typescript
let wallet = await client.deployWallet();
while (
  wallet.status !== WalletStatus.DEPLOYED &&
  wallet.status !== WalletStatus.FAILED
) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  wallet = await client.getCurrentWallet();
}

// Now the wallet is either deployed or failed.
```

Alternatively, here's an example using the helper, `deployWalletAndAwaitDeployed`:

```typescript
const walletSatus = await client.deployWalletAndAwaitDeployed();
if (walletStatus === WalletStatus.DEPLOYED) {
  // The wallet is deployed!
} else {
  // The wallet failed to deploy.
}
```

Once the wallet is deployed, you can initialize it. However, first you'll need signing keys for the wallet to complete sensitive operations.

#### Key generation for the wallet

When initializing the wallet, you'll need to provide a public key for the wallet to use to sign transactions. Note that this _is not_ the same as your JWT signing key used above. It should be unique to each user's wallet. It is the responsibility of your application to safely store the keypair for the user. Losing the private key will result in the user losing access to their wallet. Currently, the wallet SDK only supports RSA-PSS keys, but we plan to support other key types in the future.

For convenience, the wallet SDK provides a `DefaultCrypto.generateSigningKeyPair()` method which can be used to generate a keypair. You can then store the keys however you'd like in your application code.

```typescript
import { DefaultCrypto } from "@lightsparkdev/core";

const keyPair = await DefaultCrypto.generateSigningKeyPair();
const signingWalletPublicKey = keyPair.publicKey;
const signingWalletPrivateKey = keyPair.privateKey;

const serializedPublicKeyBytes = await DefaultCrypto.serializeSigningKey(
  signingWalletPublicKey,
  "spki",
);
const serializedPrivateKeyBytes = await DefaultCrypto.serializeSigningKey(
  signingWalletPrivateKey,
  "pkcs8",
);
// Store the keys somewhere safe.
```

#### Initializing the wallet

Now that you've got keys, you can initialize the wallet! Just like when deploying, you can do this either by polling the wallet, or by subscribing to wallet updates via `client.initializeWalletAndAwaitReady`.

```typescript
let wallet = await client.initializeWallet(
  KeyType.RSA_OAEP,
  b64encode(serializedPublicKeyBytes),
  b64encode(serializedPrivateKeyBytes),
);
while (
  wallet.status !== WalletStatus.READY &&
  wallet.status !== WalletStatus.FAILED
) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  wallet = await client.getCurrentWallet();
}

// Now the wallet is either ready or failed.
```

Alternatively, here's an example using the helper, `initializeWalletAndAwaitReady`:

```typescript
const walletSatus = await client.initializeWalletAndAwaitReady(
  KeyType.RSA_OAEP,
  signingWalletPublicKey,
  signingWalletPrivateKey,
);
if (walletStatus === WalletStatus.READY) {
  // The wallet is initialized!
} else {
  // The wallet failed to initialize.
}
```

#### Unlock the wallet and make requests

When the wallet is in the READY state, you can make requests. However, in order to complete sensitive operations like sending payments, first you'll need to unlock the wallet using the private key you generated earlier.

```typescript
await client.loadWalletSigningKey(signingWalletPrivateKey);
```

Now you can make requests! For example, to create an invoice:

```typescript
const invoiceData = await client.createInvoice(
  /* amountMsats */: 100_000,
  /* memo */ "mmmmm pizza",
);
```

or pay an invoice:

```typescript
const payment = await client.payInvoice(
  /* encodedInvoice */ invoiceData.encodedPaymentRequest,
  /* maxFeesMsats */ 50_000,
);
```

For more examples, check out the [examples/node-scripts](./examples/node-scripts/) directory.

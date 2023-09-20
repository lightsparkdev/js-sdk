# The Lightspark JS+TS SDK

![npm (scoped)](https://img.shields.io/npm/v/@lightsparkdev/lightspark-sdk)

This is the Lightspark Typescript SDK, which can be used either from a node or browser environment. It's used to manage accounts, nodes, wallets, etc. See the examples directory for some examples of how to use it!

## Getting started

To use the SDK, you'll need to install it from npm:

```bash
$ npm install @lightsparkdev/lightspark-sdk
```

The entry-point to the SDK is the `LightsparkClient` class, which can be imported from the root package.
To create and authenticate a client from a server-environment, you'll need to provide your API token ID and secret. You can create these from the [Lightspark API Tokens page](https://app.lightspark.com/api-config).

```typescript
import { AccountTokenAuthProvider, LightsparkClient } from "@lightsparkdev/lightspark-sdk";

const TOKEN_ID = <your api token id>;
// NOTE: This should be stored securely, e.g. in an environment variable and shouldn't be present in client-side code.
const TOKEN_SECRET = <your api token secret>;

const lightsparkClient = new LightsparkClient(
    new AccountTokenAuthProvider(TOKEN_ID, TOKEN_SECRET)
);
```

If you want to use the client in a browser environment, you'll need to use a different authentication provider. The `OAuthProvider` can be used to authenticate with the user's Lightspark account. It will open a popup window to the Lightspark login page, and then exchange the authorization code for an access token.

You can then use the client to make API calls. For example, to create an invoice:

```typescript
const encodedInvoice = await lightsparkClient.createInvoice({
  amount: { value: 100, unit: CurrencyUnit.SATOSHI },
  memo: "Whasssupppp",
  type: InvoiceType.AMP,
});

const invoiceDetails = await lightsparkClient.decodeInvoice(encodedInvoice);
console.log(invoiceDetails);
```

To complete sensitive operations like paying an invoice, you'll need to unlock the paying node using its node ID and password:

```typescript
const nodeID = <the node ID of a node to unlock>;
const nodePassword = <the password used to unlock the node>;

try {
    await lightsparkClient.loadNodeSigningKey(nodeID, { password: nodePassword });
} catch (e) {
    console.error("Failed to unlock node", e);
}

// Now we can pay the invoice.
const payment = await lightsparkClient.payInvoice(nodeID, encodedInvoice, 1000);
console.log(`Payment details: ${payment}`);
```

You can also use the SDK to subscribe to events from the node, such as transaction updates. For example, to subscribe to transaction updates for a node:

```typescript
const nodeID = <the node ID of a node to subscribe to>;
let subscription;

function startListening(nodeId: string) {
    if (subscription) {
        return;
    }
    console.log("Starting to listen for transactions...");

    subscription = lightsparkClient.listenToTransactions([nodeID]).subscribe({
        next: (transaction) => {
            if (transaction) {
                console.log(`Transaction updated! ${JSON.stringify(transaction)}`);
            }
        },
    });
}

function stopListening() {
    if (!subscription) {
        return;
    }
    console.log("Stopping listening for transactions...");

    subscription.unsubscribe();
    subscription = undefined;
}
```

## Examples

Several examples of SDK usage are included in the top-level `examples` directory.

### Node scripts:

Try the node script examples using ts-node!

You'll need to set the following environment variables:

```bash
$ export LIGHTSPARK_API_TOKEN_CLIENT_ID=<your api token id>
$ export LIGHTSPARK_API_TOKEN_CLIENT_SECRET=<your api token secret>
$ export LIGHTSPARK_TEST_NODE_PASSWORD=<the test node password (1234!@#$)>

# If you want to run internal_example.ts, you'll also need to set these:
$ export LIGHTSPARK_EXAMPLE_NODE_1_NAME=<the display name of a node to use in the example>
$ export LIGHTSPARK_EXAMPLE_NODE_2_NAME=<the display name of a node to use in the example>
$ export LIGHTSPARK_EXAMPLE_NODE_2_PASSWORD=<the password used to unlock node 2>
```

Then, run the examples:

```bash
$ cd examples/node-scripts
$ npm install
$ npx ts-node createInvoice.ts -a "100" -m "Whasssupppp"
```

### Streaming Wallet Extension

This example is meant to be used in conjunction with the [Lightspark streaming sats demo](https://app.lightspark.com/demos/streaming). It can be built and installed as a Chrome extension by running (from root js-sdk directory):

```bash
$ yarn
$ yarn build
```

Then, go to `chrome://extensions` and click "Load unpacked" and select the `apps/examples/streaming-wallet-extension/build` directory.

When the extension is installed, it will automatically open the streaming sats demo page. You can then click extension icon to open the extension popup, which will give you the ability to create a test account with 2 nodes - a viewer node (which acts as your wallet for the demo), and a creator node, which simulates the wallet of the creator of the streaming content. The page will reload and you'll be able to start streaming sats as the video plays!

To see how it works, check out the background directory in the extension code. It uses the SDK to create an invoice on behalf of the creator node, then uses the SDK to pay the invoice on behalf of the viewer node. It also uses the SDK to get the current balance of both nodes and listen for transaction updates, which it broadcasts to the webpage.

# Lightspark JWT Server Example

This example demonstrates how to generate a JWT for a user from a node server. It uses the `jsonwebtoken` library to generate the JWT. The only endpoint is a single express route in `src/index.ts`, which generates the JWT and returns it to the client. It also saves a user ID, derived password key, and password salt in a [Level](https://leveljs.org/) database, which can be used to sign in again later as the same user.

You can see how this server is called in `js-sdk/apps/examples/react-wallet-app/src/pages/LoginPage.tsx`.

## Configuration

### Setting up your environment

1. Install the [@lightsparkdev/wallet-cli](https://www.npmjs.com/package/@lightsparkdev/wallet-cli).
2. Follow the steps to [initialize your environment](https://www.npmjs.com/package/@lightsparkdev/wallet-cli#init-env).

### Setting up ngrok

1. [Sign up](https://dashboard.ngrok.com/signup) for an ngrok account.
2. Follow [setup and installation](https://dashboard.ngrok.com/get-started/setup) steps for your operating system.

## Running the demo server

1. `yarn start` (this starts the express server locally)
2. `yarn ngrok`

## Testing the demo server

Now that you have the demo server running, you can hit the `getJwt` endpoint locally at port 3000:

```http://localhost:3000/getJwt?userId=foo&password=bar```

Or with ngrok running, use the publicly available forwarding address to do the same.

# Lightspark React Wallet Website Example

This example demonstrates how to use the react-wallet library to initialize and authenticate a Lightspark Wallet SDK client. See the `src/auth` directory for the most relevant code. The LoginPage uses the `useJwtAuth` hook to handle the OAuth flow and redirects to the DashboardPage when the user is authenticated.

## Running the example

1. Follow the [instructions](https://github.com/lightsparkdev/js-sdk#running-the-sdks-and-examples) on setting up the js-sdk workspace to run these examples locally.
2. Run the [JWT Server example](https://github.com/lightsparkdev/js-sdk/tree/main/apps/examples/jwt-server).
3. Then run `yarn start` from this directory to launch the app at http://localhost:3002.

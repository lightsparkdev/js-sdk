# Lightspark JWT Server Example

This example demonstrates how to generate a JWT for a user from a node server. It uses the `jsonwebtoken` library to generate the JWT. The only endpoint is a single Firebase Function in `functions/src/index.ts`, which generates the JWT and returns it to the client. It also saves a user ID and hashed password in a Firestore database, which can be used to sign in again later as the same user.

You can see how this server is called in `js-sdk/packages/react-wallet/examples/hooks-example/src/pages/LoginPage.tsx`.

## Configuration

The signing private key and account ID are saved in the [firebase functions config](https://firebase.google.com/docs/functions/config-env?authuser=2#environment_configuration). The currently deployed instance of this server uses a test account config, whose wallets are periodically cleaned out. If you want to use this server for your own testing, you'll need to create your own firebase project and set up your own account config. You can do this by running the following commands from the `functions` directory:

```bash
$ firebase functions:config:set account.id=<your lightspark account id>
$ firebase functions:config:set account.signing_private_key=<your private key>
```

The signing key should be a private key in PEM format. You can generate a keypair using the _ES256_ algorithm using the following command:

```bash
openssl ecparam -genkey -name prime256v1 -noout -out private.key
```

This will generate a private key file called private.key. You can then generate the public key file using the following command:

```bash
openssl ec -in private.key -pubout -out public.key
```

You can then copy the contents of the public key file into the "JWT Public Key" field on the API Tokens page on the Lightspark Dashboard. You'll also want to copy the private key into your server code (or rather in secret keystore or environment variable), so that you can use it to sign JWTs.

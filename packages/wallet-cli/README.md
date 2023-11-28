# Lightspark Wallet CLI

![npm (scoped)](https://img.shields.io/npm/v/@lightsparkdev/wallet-cli)

The `lightspark-wallet` script is a wrapper around the `wallet-sdk` which can simplify testing simple wallet commands from your command-line. You can install it from source via `npm i -g` or from the [npm package](https://www.npmjs.com/package/@lightsparkdev/wallet-cli): `npm i -g @lightsparkdev/wallet-cli`.

## init-env

The first command you'll need to run get set up is init-env.

You'll need to provide your Company Account ID and a JWT signing key that can mint wallet JWTs. You can set this up from the [Lightspark Account Settings page](https://app.lightspark.com/account#security). For more info on JWT authentication, see the [Lightspark Wallet Authentication docs](https://docs.lightspark.com/wallet-sdk/authentication?language=Typescript).

If you run it without any arguments, it will prompt you for your account ID and JWT signing key:

```bash
lightspark-wallet init-env
```

You can also directly pass these on the command line:

```bash
lightspark-wallet init-env -a <your account ID here> -k "-----BEGIN PRIVATE KEY-----
<your jwt signing private key here>
-----END PRIVATE KEY-----"
```

Once you've run init-env, it will create a `.lightsparkenv` file in your home directory with your account ID and JWT signing key.

There are lots of commands! Check out `lightspark-wallet --help` for more usage info.

## create-and-init-wallet

This command will create a new wallet for the user and initialize it using new signing keys. It will also mint a JWT for the user and store it in `.lightsparkenv` for future use.

```bash
lightspark-wallet create-and-init-wallet -u someUserId123 --test
```

This will create a test wallet, deploy it, create signing keys, initialize the wallet, and save everything in `.lightsparkenv`. You can then use the `lightspark-wallet` command to run other commands, like `wallet-dashboard` or `create-invoice`:

```bash
lightspark-wallet wallet-dashboard -u someUserId123
lightspark-wallet create-invoice -u someUserId123 -a 100 -m "Pizza time"
```

### Example flow

Here's full example of how you might use the `lightspark-wallet` script to test out the wallet SDK:

```bash
# Create a new wallet for the user and initialize it.
lightspark-wallet create-and-init-wallet -u user1

# Get the balances for the user.
lightspark-wallet balances -u user1

# Create a bitcoin funding address for the user so you can fund the wallet
lightspark-wallet funding-address -u user1

# Fund the wallet by sending bitcoin to the address you just created.
# Once that transaction is confirmed, you can check the balances again.
lightspark-wallet balances -u user1

# Create a new wallet for another user.
lightspark-wallet create-and-init-wallet -u user2

# Send some money from user1 to user2.
lightspark-wallet create-invoice -u user2 -a 100 -m "Pizza time"

# Pay the invoice from user1.
lightspark-wallet pay-invoice -u user1 -i <encoded invoice here>
```

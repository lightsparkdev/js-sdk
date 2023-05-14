# Node Scripts

These test scripts are meant to be run using the `ts-node` command. You can install it and other required deps by running `npm install` from this directory. Then you can run scripts! For example:

```bash
ts-node getWalletDashboard.ts
```

If you ran this without setting any environment variables, you probably got an error! The lightspark-cli script can help you get things set up!

## lightspark-cli

The `lightspark-cli` script is a wrapper around the `wallet-sdk` which can simplify testing simple wallet commands from your command-line.

### init-env

The first command you'll need to run get set up is init-env:

```bash
ts-node lightspark-cli.ts init-env -a <your account ID here> -k "-----BEGIN PRIVATE KEY-----
<your jwt signing private key here>
-----END PRIVATE KEY-----"
```

You'll need to provide your Company Account ID and a JWT signing key that can mint wallet JWTs. You can set this up from the [Lightspark Account Settings page](https://app.lightspark.com/account#security). For more info on JWT authentication, see the [Lightspark Wallet Authentication docs](https://app.lightspark.com/docs/api/wallet/authentication).

Once you've run init-env, it will create a `.lightsparkenv` file in your home directory with your account ID and JWT signing key. It also includes an alias `lightspark-cli` to make it easier to run future commands. You can add `source ~/.lightsparkenv` to your `.bashrc`, `.zshrc`, `.zprofile`, etc. to make sure the alias and evironment variables are always available.

There are lots of commands! Check out `lightspark-cli --help` for more usage info.

### create-and-init-wallet

This command will create a new wallet for the user and initialize it with a name and a currency. It will also mint a JWT for the user and store it in `.lightsparkenv` for future use.

```bash
lightspark-cli create-and-init-wallet -u someUserId123 --test
```

This will create a test wallet, deploy it, create signing keys, initialize the wallet, and save everything in `.lightsparkenv`. You can then use the `lightspark-cli` command to run other commands, like `wallet-dashboard` or `create-invoice`:

```bash
lightspark-cli wallet-dashboard -u someUserId123
lightspark-cli create-invoice -u someUserId123 -a 100 -m "Pizza time"
```

### Example flow

Here's full example of how you might use the `lightspark-cli` script to test out the wallet SDK:

```bash
# Create a new wallet for the user and initialize it.
lightspark-cli create-and-init-wallet -u user1

# Get the balances for the user.
lightspark-cli balances -u user1

# Create a bitcoin funding address for the user so you can fund the wallet
lightspark-cli funding-address -u user1

# Fund the wallet by sending bitcoin to the address you just created.
# Once that transaction is confirmed, you can check the balances again.
lightspark-cli balances -u user1

# Create a new wallet for another user.
lightspark-cli create-and-init-wallet -u user2

# Send some money from user1 to user2.
lightspark-cli create-invoice -u user2 -a 100 -m "Pizza time"

# Pay the invoice from user1.
lightspark-cli pay-invoice -u user1 -i <encoded invoice here>
```

## Other scripts

Once your environment is configured, you can run other scripts in this directory using ts-node. For example:

```bash
ts-node getWalletDashboard.ts
```

Or the full example script:

```bash
ts-node example.ts
```

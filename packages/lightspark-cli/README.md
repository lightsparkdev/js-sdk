# Lightspark API CLI

![npm (scoped)](https://img.shields.io/npm/v/@lightsparkdev/lightspark-cli)

The `lightspark` script is a wrapper around the `lightspark-sdk` which can simplify testing simple lightspark API commands from your command-line. You can install it from source via `npm i -g` or from the [npm package](https://www.npmjs.com/package/@lightsparkdev/lightspark-cli): `npm i -g @lightsparkdev/lightspark-cli`.

## init-env

The first command you'll need to run get set up is init-env.

You'll need to provide your API token's client ID and client secret. You can set this up from the [Lightspark API config page](https://app.lightspark.com/api-config). For more info on API authentication, see the [Lightspark API Authentication docs](https://app.lightspark.com/docs/api/authentication).

If you run it without any arguments, it will prompt you for your API token's client ID and client secret:

```bash
lightspark init-env
```

You can also directly pass these on the command line:

```bash
lightspark init-env -c <your client ID here> -s <your client secret here>
```

Once you've run init-env, it will create a `.lightsparkapienv` file in your home directory with your API token's client ID and client secret.

There are lots of commands! Check out `lightspark --help` for more usage info.

### Example flow

Here's full example of how you might use the `lightspark` script to test out the lightspark SDK:

```bash
# Get the balances for the account.
lightspark balances

# Create a bitcoin funding address for the account.
lightspark funding-address

# Fund the account by sending bitcoin to the address you just created.
# Once that transaction is confirmed, you can check the balances again.
lightspark balances

# Create an invoice.
lightspark create-invoice -a 100 -m "Pizza time"

# Pay the invoice with a test payment.
lightspark create-test-mode-payment -i <encoded invoice here>
```

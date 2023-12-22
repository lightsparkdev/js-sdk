# Demo UMA VASP CLI

The `uma-vasp-cli` tool is a wrapper around the example UMA VASP to allow sending interactive command-line UMA transactions. You can install it from source via `npm i -g` or just run it locally via `yarn cli`.

## Usage

### Starting the demo VASP

First, you'll need to have your demo VASP running somewhere (see [the example UMA VASP README](../uma-vasp/README.md) for instructions on how to do that). You can run the VASP locally or on a server, but you'll need to make sure that the server is accessible from the internet.

### Sending payments

If your demo vasp is hosted at `https://your-uma-vasp.com`, you can send a transaction to it via:

```bash
uma-vasp send -e https://your-uma-vasp.com
```

Alternatively, you can set your vasp's URL in the `UMA_VASP_ENDPOINT` environment variable. The `send` command will then default to using that endpoint. This command will prompt you for the intended receiver, show currency options and exchange rates, prompt you for the amount, and then send the transaction.

You can also skip the first prompt by passing in the receiver as a command-line argument:

```bash
uma-vasp send -e https://your-uma-vasp.com -r $alice@vasp2.com
```

To see all available options, run `uma-vasp send --help`.

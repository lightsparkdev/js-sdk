#!/usr/bin/env node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { confirm, input } from "@inquirer/prompts";
import { b64encode, DefaultCrypto, KeyOrAlias } from "@lightsparkdev/core";
import {
  InMemoryJwtStorage,
  InvoiceType,
  KeyType,
  LightsparkClient,
  WalletStatus,
} from "@lightsparkdev/wallet-sdk";
import { Command, OptionValues } from "commander";
import * as fs from "fs/promises";
import * as jsonwebtoken from "jsonwebtoken";
import qrcode from "qrcode-terminal";
import { EnvCredentials, getCredentialsFromEnvOrThrow } from "./authHelpers.js";

const jwt = jsonwebtoken["default"] as unknown as typeof jsonwebtoken;

const main = async (
  options: OptionValues,
  action: (
    client: LightsparkClient,
    options: OptionValues,
    credentials?: EnvCredentials
  ) => Promise<any>,
  skipLogin = false
) => {
  const credentials = getCredentialsFromEnvOrThrow(
    options.walletUserId ? `_${options.walletUserId}` : ""
  );
  const client = new LightsparkClient(undefined, credentials.baseUrl);
  if (!skipLogin) {
    await client.loginWithJWT(
      credentials.accountId,
      credentials.jwt,
      new InMemoryJwtStorage()
    );
  }
  await action(client, options, credentials);
};

const initEnv = async (options: OptionValues) => {
  let accountId = options.accountId;
  let jwtSigningKey = options.jwtSigningKey;
  if (!accountId) {
    accountId = await input({
      message:
        "What is your account ID (ex: Account:01857e8b-cc47-9af2-0000-eb2de1fdeffe)?",
      validate: (value) => value.startsWith("Account:"),
    });
  }
  if (!options.jwtSigningKey) {
    jwtSigningKey = await input({
      message:
        "What is your JWT signing key (should start with -----BEGIN PRIVATE KEY-----)?",
      validate: (value) => value.startsWith("-----BEGIN"),
    });
  }
  const filePath = process.env.HOME + "/.lightsparkenv";
  let content = `export LIGHTSPARK_ACCOUNT_ID="${options.accountId}"\n`;
  content += `export LIGHTSPARK_JWT_PRIV_KEY="${options.jwtSigningKey}"\n`;
  if (options.walletPrivateKey) {
    content += `export LIGHTSPARK_WALLET_PRIV_KEY="${options.walletPrivateKey}"\n`;
  }
  if (options.jwt) {
    content += `export LIGHTSPARK_JWT="${options.jwt}"\n`;
  }
  if (options.env === "dev") {
    content += `export LIGHTSPARK_EXAMPLE_BASE_URL="api.dev.dev.sparkinfra.net"\n`;
  }
  await fs.writeFile(filePath, content);

  console.log("Wrote environment variables to " + filePath);
  console.log("Run `source " + filePath + "` to load them into your shell");
  console.log(
    "To add them to your shell permanently, add the above line to your shell's startup script"
  );
  console.log("You can now run `lightspark-cli` to interact with your wallet");
};

const createInvoice = async (
  client: LightsparkClient,
  options: OptionValues
) => {
  console.log(
    "Creating an invoice with options: ",
    JSON.stringify(options, null, 2),
    "\n"
  );
  const invoice = await client.createInvoice(
    options.amount * 1000,
    options.memo,
    options.amp ? InvoiceType.AMP : InvoiceType.STANDARD
  );
  if (!invoice) {
    throw new Error("Failed to create invoice");
  }
  console.log("Invoice:", JSON.stringify(invoice, null, 2));
  qrcode.generate(invoice.encodedPaymentRequest, { small: true });
};

const transactions = async (
  client: LightsparkClient,
  options: OptionValues
) => {
  console.log(
    "Fetching transactions with options: ",
    JSON.stringify(options, null, 2),
    "\n"
  );
  const wallet = await client.getCurrentWallet();
  if (!wallet) {
    throw new Error("Failed to get current wallet");
  }
  const transactionList = await wallet.getTransactions(client, options.count);
  console.log(
    "Transactions:",
    JSON.stringify(transactionList?.entities, null, 2)
  );
};

const invoices = async (client: LightsparkClient, options: OptionValues) => {
  console.log(
    "Fetching payment requests with options: ",
    JSON.stringify(options, null, 2),
    "\n"
  );
  const wallet = await client.getCurrentWallet();
  if (!wallet) {
    throw new Error("Failed to get current wallet");
  }
  const paymentRequests = await wallet.getPaymentRequests(
    client,
    options.count
  );
  console.log(
    "paymentRequests:",
    JSON.stringify(paymentRequests?.entities, null, 2)
  );
};

const balances = async (client: LightsparkClient, options: OptionValues) => {
  console.log("Fetching wallet balances...\n");
  const wallet = await client.getCurrentWallet();
  if (!wallet) {
    throw new Error("Failed to get current wallet");
  }
  const balances = wallet.balances;
  console.log("Balances:", JSON.stringify(balances, null, 2));
};

const l1FeeEstimate = async (
  client: LightsparkClient,
  options: OptionValues
) => {
  console.log("Fetching bitcoin L1 fee estimate...\n");
  const feeEstimate = await client.getBitcoinFeeEstimate();
  console.log("Fee estimates:", JSON.stringify(feeEstimate, null, 2));
};

const walletDashboard = async (
  client: LightsparkClient,
  options: OptionValues
) => {
  console.log("Fetching wallet dashboard...\n");
  const dashboard = await client.getWalletDashboard();
  console.log("Dashboard:", JSON.stringify(dashboard, null, 2));
};

const currentWallet = async (
  client: LightsparkClient,
  options: OptionValues
) => {
  console.log("Fetching current wallet...\n");
  const wallet = await client.getCurrentWallet();
  console.log("Wallet:", JSON.stringify(wallet, null, 2));
};

const decodeInvoice = async (
  client: LightsparkClient,
  options: OptionValues
) => {
  console.log("Decoding invoice...\n");
  const decodedInvoice = await client.decodeInvoice(options.invoice);
  console.log("Decoded invoice:", JSON.stringify(decodedInvoice, null, 2));
};

const createBitcoinFundingAddress = async (
  client: LightsparkClient,
  options: OptionValues,
  credentials?: EnvCredentials
) => {
  console.log("Creating bitcoin funding address...\n");
  const privateKey = credentials?.privKey;
  if (!privateKey) {
    throw new Error(
      "Private key not found in environment. Set LIGHTSPARK_WALLET_PRIV_KEY."
    );
  }
  await client.loadWalletSigningKey(KeyOrAlias.key(privateKey));
  const address = await client.createBitcoinFundingAddress();
  console.log("Address:", address);
};

const payInvoice = async (
  client: LightsparkClient,
  options: OptionValues,
  credentials?: EnvCredentials
) => {
  console.log("Paying invoice...\n");
  const privateKey = credentials?.privKey;
  if (!privateKey) {
    throw new Error(
      "Private key not found in environment. Set LIGHTSPARK_WALLET_PRIV_KEY."
    );
  }
  await client.loadWalletSigningKey(KeyOrAlias.key(privateKey));
  const payment = await client.payInvoice(
    options.invoice,
    1000_000,
    options.amount === -1 ? undefined : (options.amount * 1000)
  );
  console.log("Payment:", JSON.stringify(payment, null, 2));
};

const createWalletJwt = async (
  client: LightsparkClient,
  options: OptionValues,
  credentials?: EnvCredentials
) => {
  console.log("Creating wallet JWT...\n");
  const privateKey = credentials?.jwtSigningPrivateKey;
  if (!privateKey) {
    throw new Error(
      "JWT signing private key not found in environment. Set LIGHTSPARK_JWT_PRIV_KEY."
    );
  }
  let userId = options.userId;
  let test = options.test;
  if (!options.userId) {
    userId = await input({
      message: "Enter a unique user ID for the wallet: ",
    });
    test = await confirm({ message: "Use test environment?" });
  }
  const claims = {
    aud: "https://api.lightspark.com",
    // Any unique identifier for the user.
    sub: userId,
    // True to use the test environment, false to use production.
    test: options.test,
    iat: Math.floor(Date.now() / 1000),
    // Expriation time for the JWT is 30 days from now.
    exp: options.expireAt,
  };
  console.log("claims", claims);
  const token = jwt.sign(claims, privateKey, { algorithm: "ES256" });
  console.log("Account ID:", credentials.accountId);
  console.log("JWT:", token);
  return { token, userId, test };
};

const createDeployAndInitWallet = async (
  client: LightsparkClient,
  options: OptionValues,
  credentials?: EnvCredentials
) => {
  if (!credentials) {
    throw new Error("Credentials not found in environment.");
  }
  const { token, userId, test } = await createWalletJwt(
    client,
    options,
    credentials
  );
  console.log("Creating wallet...\n");
  const loginOutput = await client.loginWithJWT(
    credentials.accountId,
    token,
    new InMemoryJwtStorage()
  );
  console.log("Wallet:", JSON.stringify(loginOutput.wallet, null, 2));
  let serializedKeypair: { privateKey: string; publicKey: string } | undefined =
    undefined;
  let deployedResultStatus: WalletStatus = loginOutput.wallet.status;
  if (loginOutput.wallet.status === WalletStatus.NOT_SETUP) {
    console.log("Deploying wallet...\n");
    deployedResultStatus = await client.deployWalletAndAwaitDeployed();
    console.log(
      "Deployed wallet:",
      JSON.stringify(deployedResultStatus, null, 2)
    );
  }
  if (deployedResultStatus === WalletStatus.DEPLOYED) {
    console.log("Initializing wallet...\n");
    const keypair = await DefaultCrypto.generateSigningKeyPair();
    serializedKeypair = {
      privateKey: b64encode(
        await DefaultCrypto.serializeSigningKey(keypair.privateKey, "pkcs8")
      ),
      publicKey: b64encode(
        await DefaultCrypto.serializeSigningKey(keypair.publicKey, "spki")
      ),
    };
    console.log("Keypair:", JSON.stringify(serializedKeypair, null, 2));
    console.log("Initializing wallet now. This will take a while...\n");
    const initializedWallet = await client.initializeWalletAndAwaitReady(
      KeyType.RSA_OAEP,
      serializedKeypair.publicKey,
      KeyOrAlias.key(serializedKeypair.privateKey)
    );
    console.log(
      "Initialized wallet:",
      JSON.stringify(initializedWallet, null, 2)
    );
  } else {
    console.log(
      `Not initializing because the wallet status is ${loginOutput.wallet.status}`
    );
  }

  console.log(
    "\n\nExport these env vars to use this wallet. Appending to ~/.lightsparkenv:\n"
  );
  let content = `\n# Wallet for user ${userId}:\n# accountID: ${credentials.accountId}\n# test: ${test}\n`;
  content += `export LIGHTSPARK_JWT_${userId}="${token}"\n`;
  process.env[`LIGHTSPARK_JWT_${userId}`] = token;
  if (serializedKeypair) {
    content += `export LIGHTSPARK_WALLET_PRIV_KEY_${userId}="${serializedKeypair?.privateKey}"\n`;
    content += `export LIGHTSPARK_WALLET_PUB_KEY_${userId}="${serializedKeypair?.publicKey}"\n`;

    process.env[`LIGHTSPARK_WALLET_PRIV_KEY_${userId}`] =
      serializedKeypair.privateKey;
    process.env[`LIGHTSPARK_WALLET_PUB_KEY_${userId}`] =
      serializedKeypair.publicKey;
  }

  console.log(content);
  const filePath = process.env.HOME + "/.lightsparkenv";
  await fs.appendFile(filePath, content);
};

(() => {
  const createInvoiceCmd = new Command("create-invoice")
    .description("Create an invoice for your wallet")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined
    )
    .option(
      "-m, --memo  <value>",
      "Add a memo describing the invoice.",
      undefined
    )
    .option(
      "-a, --amount <number>",
      "The amount of the invoice in sats.",
      parseInt,
      0
    )
    .option("--amp", "Flag to use AMP invoices.", false)
    .action((options) => {
      main(options, createInvoice).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const recentTxCmd = new Command("transactions")
    .description("Get recent transactions for your wallet")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined
    )
    .option(
      "-n, --count  <number>",
      "Max number of transactions to fetch.",
      parseInt,
      25
    )
    .action((options) => {
      main(options, transactions).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const recentInvoicesCmd = new Command("invoices")
    .description("Get recent payment requests from your wallet")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined
    )
    .option(
      "-n, --count  <number>",
      "Max number of invoices to fetch.",
      parseInt,
      25
    )
    .action((options) => {
      main(options, invoices).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const decodeInvoiceCmd = new Command("decode-invoice")
    .description("Decode and encoded payment request")
    .option("-i, --invoice  <value>", "The encoded payment request.")
    .action((options) => {
      main(options, decodeInvoice).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const balancesCmd = new Command("balances")
    .description("Get balances for your wallet")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined
    )
    .action((options) => {
      main(options, balances).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const l1FeeEstimateCmd = new Command("bitcoin-fee-estimate")
    .description("Get bitcoin L1 fee estimate")
    .action((options) => {
      main(options, l1FeeEstimate).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const walletDashboardCmd = new Command("wallet-dashboard")
    .description("Get wallet dashboard")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined
    )
    .action((options) => {
      main(options, walletDashboard).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const currentWalletCmd = new Command("wallet")
    .description("Get current wallet")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined
    )
    .action((options) => {
      main(options, currentWallet).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const createBitcoinFundingAddressCmd = new Command("funding-address")
    .description("Create a bitcoin funding address for your wallet.")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined
    )
    .action((options) => {
      main(options, createBitcoinFundingAddress).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const payInvoiceCmd = new Command("pay-invoice")
    .description("Pay an invoice from your wallet.")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined
    )
    .option("-i, --invoice  <value>", "The encoded payment request.")
    .option("-a, --amount <number>", "The amount to pay in sats.", parseInt, -1)
    .action((options) => {
      main(options, payInvoice).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const createWalletJwtCmd = new Command("create-jwt")
    .description("Create a wallet JWT for your wallet.")
    .option("-u, --user-id  <value>", "The user ID for the wallet.")
    .option(
      "-e, --expire-at <number>",
      "The jwt expiration time in seconds since epoch. Defaults to 30 days from now.",
      parseInt,
      Math.floor((Date.now() + 1000 * 60 * 60 * 24 * 30) / 1000)
    )
    .option("-t --test", "Flag to create this wallet jwt in test mode.", false)
    .action((options) => {
      main(options, createWalletJwt, true).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const createDeployAndInitWalletCmd = new Command("create-and-init-wallet")
    .description(
      "Create, deploy, and initialize a new wallet. Will print out all relevant keys, etc."
    )
    .option("-u, --user-id  <value>", "The user ID for the wallet.")
    .option(
      "-e, --expire-at <number>",
      "The jwt expiration time in seconds since epoch. Defaults to 30 days from now.",
      parseInt,
      Math.floor((Date.now() + 1000 * 60 * 60 * 24 * 30) / 1000)
    )
    .option("-t --test", "Flag to create this wallet in test mode.", false)
    .action((options) => {
      main(options, createDeployAndInitWallet, true).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const InitEnvCmd = new Command("init-env")
    .description("Initialize your environment with required variables.")
    .option("-a --account-id <value>", "Your account ID.")
    .option("-k --jwt-signing-key <value>", "Your JWT-signing private key.")
    .option("-e --env <value>", "The environment to use (prod or dev).", "prod")
    .option("-j --jwt <value>", "A default wallet jwt (optional).", undefined)
    .option(
      "-w --wallet-private-key <value>",
      "Your default wallet signing private key (optional).",
      undefined
    )
    .action((options) => {
      initEnv(options).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  new Command("lightspark-wallet")
    .description(
      "Lightspark Wallet CLI. Start by running init-env to set up your environment."
    )
    .version("1.0.0")
    .addCommand(createInvoiceCmd)
    .addCommand(recentTxCmd)
    .addCommand(balancesCmd)
    .addCommand(recentInvoicesCmd)
    .addCommand(l1FeeEstimateCmd)
    .addCommand(walletDashboardCmd)
    .addCommand(currentWalletCmd)
    .addCommand(decodeInvoiceCmd)
    .addCommand(createBitcoinFundingAddressCmd)
    .addCommand(payInvoiceCmd)
    .addCommand(createWalletJwtCmd)
    .addCommand(createDeployAndInitWalletCmd)
    .addCommand(InitEnvCmd)
    .addHelpCommand()
    .parse(process.argv);
})();

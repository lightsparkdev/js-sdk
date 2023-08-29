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
import type { OptionValues } from "commander";
import { Command, InvalidArgumentError } from "commander";
import type { KeyObject } from "crypto";
import * as fs from "fs/promises";
import * as jose from "jose";
import * as jsonwebtoken from "jsonwebtoken";
import qrcode from "qrcode-terminal";
import type { EnvCredentials } from "./authHelpers.js";
import {
  getCredentialsFromEnvOrThrow,
  RequiredCredentials,
  RequiredWalletCredentials,
} from "./authHelpers.js";
import { getPackageVersion } from "./helpers.js";

const jwt = jsonwebtoken["default"] as unknown as typeof jsonwebtoken;

const main = async (
  options: OptionValues,
  action: (
    client: LightsparkClient,
    options: OptionValues,
    credentials?: EnvCredentials,
  ) => Promise<unknown>,
  skipLogin = false,
) => {
  const credentials = getCredentialsFromEnvOrThrow(
    options.walletUserId ? `_${options.walletUserId}` : "",
    !skipLogin,
  );
  const client = new LightsparkClient(undefined, credentials.baseUrl);
  if (!skipLogin) {
    await client.loginWithJWT(
      credentials.accountId,
      credentials.jwt,
      new InMemoryJwtStorage(),
    );
  }
  await action(client, options, credentials);
};

const initEnv = async (options: OptionValues) => {
  let accountId = options.accountId;
  let jwtPrivateSigningKey = options.jwtPrivateSigningKey;
  let jwtPublicSigningKey;
  if (!accountId) {
    accountId = await input({
      message:
        "What is your account ID (ex: Account:01857e8b-cc47-9af2-0000-eb2de1fdeffe)?",
      validate: (value) => value.startsWith("Account:"),
    });
  }
  if (!options.jwtPrivateSigningKey) {
    const shouldGenerateNewKeyPair = await input({
      message:
        "Generate a new JWT key pair? To import an existing key, say no. (Y/n)",
      validate: (value) =>
        value.toUpperCase() === "Y" || value.toUpperCase() === "N",
    });
    if (shouldGenerateNewKeyPair.toLocaleUpperCase() !== "Y") {
      jwtPrivateSigningKey = await input({
        message:
          "What is your JWT signing key (should start with -----BEGIN PRIVATE KEY-----)?",
        validate: (value) => value.startsWith("-----BEGIN"),
      });
    }

    if (!jwtPrivateSigningKey) {
      const { publicKey, privateKey } =
        await jose.generateKeyPair<KeyObject>("ES256");
      jwtPublicSigningKey = publicKey.export({
        type: "spki",
        format: "pem",
      });
      jwtPrivateSigningKey = privateKey.export({
        type: "pkcs8",
        format: "pem",
      });
    }
  }

  const filePath = process.env.HOME + "/.lightsparkenv";
  const backupFilePath = process.env.HOME + "/.lightsparkenv-backup";
  try {
    await fs.stat(filePath);
    const shouldBackup = await input({
      message: `${filePath} already exists. Backup env file (Y/n)?`,
      validate: (value) =>
        value.toUpperCase() === "Y" || value.toUpperCase() === "N",
    });

    if (shouldBackup.toUpperCase() === "Y") {
      await fs.copyFile(filePath, backupFilePath);
      console.log("Created backup env file at " + backupFilePath);
    }
  } catch (e) {
    // Do nothing
  }

  let content = `export ${RequiredCredentials.AccountId}="${accountId}"\n`;
  content += `export ${RequiredCredentials.JwtPrivateKey}="${jwtPrivateSigningKey}"\n`;
  if (jwtPublicSigningKey) {
    content += `export LIGHTSPARK_JWT_PUB_KEY="${jwtPublicSigningKey}"\n`;
  }
  if (options.walletPrivateKey) {
    content += `export ${RequiredWalletCredentials.WalletPrivateKey}="${options.walletPrivateKey}"\n`;
  }
  if (options.jwt) {
    content += `export ${RequiredWalletCredentials.Jwt}="${options.jwt}"\n`;
  }
  if (options.env === "dev") {
    content += `export LIGHTSPARK_WALLET_BASE_URL="api.dev.dev.sparkinfra.net"\n`;
  }
  await fs.writeFile(filePath, content);

  console.log("Wrote environment variables to " + filePath);
  console.log(
    "You can now run `lightspark-wallet` to interact with your wallet",
  );
};

const createInvoice = async (
  client: LightsparkClient,
  options: OptionValues,
) => {
  console.log(
    "Creating an invoice with options: ",
    JSON.stringify(options, null, 2),
    "\n",
  );
  const invoice = await client.createInvoice(
    options.amount * 1000,
    options.memo,
    options.amp ? InvoiceType.AMP : InvoiceType.STANDARD,
  );
  if (!invoice) {
    throw new Error("Failed to create invoice");
  }
  console.log("Invoice:", JSON.stringify(invoice, null, 2));
  qrcode.generate(invoice.data.encodedPaymentRequest, { small: true });
};

const createTestModeInvoice = async (
  client: LightsparkClient,
  options: OptionValues,
) => {
  console.log(
    "Creating a test-mode invoice with options: ",
    JSON.stringify(options, null, 2),
    "\n",
  );
  const invoice = await client.createTestModeInvoice(
    options.amount * 1000,
    options.memo,
  );
  if (!invoice) {
    throw new Error("Failed to create invoice");
  }
  console.log("Invoice:", JSON.stringify(invoice, null, 2));
  qrcode.generate(invoice, { small: true });
};

const transactions = async (
  client: LightsparkClient,
  options: OptionValues,
) => {
  console.log(
    "Fetching transactions with options: ",
    JSON.stringify(options, null, 2),
    "\n",
  );
  const wallet = await client.getCurrentWallet();
  if (!wallet) {
    throw new Error("Failed to get current wallet");
  }
  const transactionList = await wallet.getTransactions(client, options.count);
  console.log(
    "Transactions:",
    JSON.stringify(transactionList?.entities, null, 2),
  );
};

const invoices = async (client: LightsparkClient, options: OptionValues) => {
  console.log(
    "Fetching payment requests with options: ",
    JSON.stringify(options, null, 2),
    "\n",
  );
  const wallet = await client.getCurrentWallet();
  if (!wallet) {
    throw new Error("Failed to get current wallet");
  }
  const paymentRequests = await wallet.getPaymentRequests(
    client,
    options.count,
  );
  console.log(
    "paymentRequests:",
    JSON.stringify(paymentRequests?.entities, null, 2),
  );
};

const balances = async (
  client: LightsparkClient /* options: OptionValues */,
) => {
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
  /* options: OptionValues */
) => {
  console.log("Fetching bitcoin L1 fee estimate...\n");
  const feeEstimate = await client.getBitcoinFeeEstimate();
  console.log("Fee estimates:", JSON.stringify(feeEstimate, null, 2));
};

const walletDashboard = async (
  client: LightsparkClient,
  /* options: OptionValues */
) => {
  console.log("Fetching wallet dashboard...\n");
  const dashboard = await client.getWalletDashboard();
  console.log("Dashboard:", JSON.stringify(dashboard, null, 2));
};

const currentWallet = async (
  client: LightsparkClient,
  /* options: OptionValues */
) => {
  console.log("Fetching current wallet...\n");
  const wallet = await client.getCurrentWallet();
  console.log("Wallet:", JSON.stringify(wallet, null, 2));
};

const terminateWallet = async (
  client: LightsparkClient,
  options: OptionValues,
) => {
  if (!options.force) {
    const shouldTerminate = await input({
      message:
        "Are you sure you want to terminate your wallet? " +
        "It won't be connected to the Lightning network anymore and its funds won't be " +
        "accessible outside of the Funds Recovery Kit process. (Y/n)",
      validate: (value) =>
        value.toUpperCase() === "Y" || value.toUpperCase() === "N",
    });
    if (shouldTerminate.toUpperCase() !== "Y") {
      console.log("Canceled terminating wallet.");
      return;
    }
  }
  console.log("Terminating wallet...\n");
  const wallet = await client.terminateWallet();
  if (!wallet) {
    throw new Error("Failed to terminate wallet");
  }
  console.log("Wallet terminated.");
};

const decodeInvoice = async (
  client: LightsparkClient,
  options: OptionValues,
) => {
  console.log("Decoding invoice...\n");
  const decodedInvoice = await client.decodeInvoice(options.invoice);
  console.log("Decoded invoice:", JSON.stringify(decodedInvoice, null, 2));
};

const createBitcoinFundingAddress = async (
  client: LightsparkClient,
  /* options: OptionValues */
) => {
  console.log("Creating bitcoin funding address...\n");
  const address = await client.createBitcoinFundingAddress();
  console.log("Address:", address);
};

const payInvoice = async (
  client: LightsparkClient,
  options: OptionValues,
  credentials?: EnvCredentials,
) => {
  console.log(
    "Paying invoice with options: ",
    JSON.stringify(options, null, 2),
    "\n",
  );
  const privateKey = credentials?.privKey;
  if (!privateKey) {
    throw new Error(
      "Private key not found in environment. Set LIGHTSPARK_WALLET_PRIV_KEY.",
    );
  }
  await client.loadWalletSigningKey(KeyOrAlias.key(privateKey));
  const payment = await client.payInvoice(
    options.invoice,
    1000_000,
    options.amount === -1 ? undefined : options.amount * 1000,
  );
  console.log("Payment:", JSON.stringify(payment, null, 2));
};

const createTestModePayment = async (
  client: LightsparkClient,
  options: OptionValues,
  credentials?: EnvCredentials,
) => {
  console.log("Paying invoice...\n");
  const privateKey = credentials?.privKey;
  if (!privateKey) {
    throw new Error(
      "Private key not found in environment. Set LIGHTSPARK_WALLET_PRIV_KEY.",
    );
  }
  await client.loadWalletSigningKey(KeyOrAlias.key(privateKey));
  const payment = await client.createTestModePayment(
    options.invoice,
    options.amount === -1 ? undefined : options.amount * 1000,
  );
  console.log("Payment:", JSON.stringify(payment, null, 2));
};

const createWalletJwt = async (
  client: LightsparkClient,
  options: OptionValues,
  credentials?: EnvCredentials,
) => {
  console.log("Creating wallet JWT...\n");
  const privateKey = credentials?.jwtSigningPrivateKey;
  if (!privateKey) {
    throw new Error(
      "JWT signing private key not found in environment. Set LIGHTSPARK_JWT_PRIV_KEY.",
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
    // Expiration time for the JWT is 30 days from now.
    exp: options.expireAt,
  };
  if (options.extraProps) {
    const extraProps = JSON.parse(options.extraProps);
    Object.assign(claims, extraProps);
  }
  console.log("claims", claims);
  const token = jwt.sign(claims, privateKey, { algorithm: "ES256" });
  console.log("Account ID:", credentials.accountId);
  console.log("JWT:", token);
  return { token, userId, test };
};

const createDeployAndInitWallet = async (
  client: LightsparkClient,
  options: OptionValues,
  credentials?: EnvCredentials,
) => {
  if (!credentials) {
    throw new Error("Credentials not found in environment.");
  }
  const { token, userId, test } = await createWalletJwt(
    client,
    options,
    credentials,
  );
  console.log("Creating wallet...\n");
  const loginOutput = await client.loginWithJWT(
    credentials.accountId,
    token,
    new InMemoryJwtStorage(),
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
      JSON.stringify(deployedResultStatus, null, 2),
    );
  }
  if (deployedResultStatus === WalletStatus.DEPLOYED) {
    console.log("Initializing wallet...\n");
    const keypair = await DefaultCrypto.generateSigningKeyPair();
    serializedKeypair = {
      privateKey: b64encode(
        await DefaultCrypto.serializeSigningKey(keypair.privateKey, "pkcs8"),
      ),
      publicKey: b64encode(
        await DefaultCrypto.serializeSigningKey(keypair.publicKey, "spki"),
      ),
    };
    console.log("Keypair:", JSON.stringify(serializedKeypair, null, 2));
    console.log("Initializing wallet now. This will take a while...\n");
    const initializedWallet = await client.initializeWalletAndAwaitReady(
      KeyType.RSA_OAEP,
      serializedKeypair.publicKey,
      KeyOrAlias.key(serializedKeypair.privateKey),
    );
    console.log(
      "Initialized wallet:",
      JSON.stringify(initializedWallet, null, 2),
    );
  } else {
    console.log(
      `Not initializing because the wallet status is ${loginOutput.wallet.status}`,
    );
  }

  console.log(
    "\n\nExport these env vars to use this wallet. Appending to ~/.lightsparkenv:\n",
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

const safeParseInt = (value: string /* dummyPrevious: any */) => {
  // parseInt takes a string and a radix
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError("Not a number.");
  }
  return parsedValue;
};

(() => {
  const createInvoiceCmd = new Command("create-invoice")
    .description("Create an invoice for your wallet")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined,
    )
    .option(
      "-m, --memo  <value>",
      "Add a memo describing the invoice.",
      undefined,
    )
    .option(
      "-a, --amount <number>",
      "The amount of the invoice in sats.",
      safeParseInt,
      0,
    )
    .option("--amp", "Flag to use AMP invoices.", false)
    .action((options) => {
      main(options, createInvoice).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const createTestModeInvoiceCmd = new Command("create-test-mode-invoice")
    .description("Create an invoice that you can pay in test mode.")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined,
    )
    .option(
      "-m, --memo  <value>",
      "Add a memo describing the invoice.",
      undefined,
    )
    .option(
      "-a, --amount <number>",
      "The amount of the invoice in sats.",
      safeParseInt,
      0,
    )
    .action((options) => {
      main(options, createTestModeInvoice).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const recentTxCmd = new Command("transactions")
    .description("Get recent transactions for your wallet")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined,
    )
    .option(
      "-n, --count  <number>",
      "Max number of transactions to fetch.",
      safeParseInt,
      25,
    )
    .action((options) => {
      main(options, transactions).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const recentInvoicesCmd = new Command("invoices")
    .description("Get recent payment requests from your wallet")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined,
    )
    .option(
      "-n, --count  <number>",
      "Max number of invoices to fetch.",
      safeParseInt,
      25,
    )
    .action((options) => {
      main(options, invoices).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const decodeInvoiceCmd = new Command("decode-invoice")
    .description("Decode an encoded payment request")
    .option("-i, --invoice  <value>", "The encoded payment request.")
    .action((options) => {
      main(options, decodeInvoice).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const balancesCmd = new Command("balances")
    .description("Get balances for your wallet")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined,
    )
    .action((options) => {
      main(options, balances).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const l1FeeEstimateCmd = new Command("bitcoin-fee-estimate")
    .description("Get bitcoin L1 fee estimate")
    .action((options) => {
      main(options, l1FeeEstimate).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const walletDashboardCmd = new Command("wallet-dashboard")
    .description("Get wallet dashboard")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined,
    )
    .action((options) => {
      main(options, walletDashboard).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const currentWalletCmd = new Command("wallet")
    .description("Get current wallet")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined,
    )
    .action((options) => {
      main(options, currentWallet).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const createBitcoinFundingAddressCmd = new Command("funding-address")
    .description("Create a bitcoin funding address for your wallet.")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined,
    )
    .action((options) => {
      main(options, createBitcoinFundingAddress).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const payInvoiceCmd = new Command("pay-invoice")
    .description("Pay an invoice from your wallet.")
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined,
    )
    .option("-i, --invoice  <value>", "The encoded payment request.")
    .option(
      "-a, --amount <number>",
      "The amount to pay in sats.",
      safeParseInt,
      -1,
    )
    .action((options) => {
      main(options, payInvoice).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const createTestModePaymentCmd = new Command("create-test-mode-payment")
    .description(
      "In test mode, simulates a payment from another node to an invoice.",
    )
    .option(
      "-u --wallet-user-id <value>",
      "An optional user wallet ID that was passed as the sub when creating the jwt via this CLI.",
      undefined,
    )
    .option("-i, --invoice  <value>", "The encoded payment request.")
    .option(
      "-a, --amount <number>",
      "The amount to pay in sats.",
      safeParseInt,
      -1,
    )
    .action((options) => {
      main(options, createTestModePayment).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const createWalletJwtCmd = new Command("create-jwt")
    .description("Create a wallet JWT for your wallet.")
    .option("-u, --user-id  <value>", "The user ID for the wallet.")
    .option(
      "-e, --expire-at <number>",
      "The jwt expiration time in seconds since epoch. Defaults to 30 days from now.",
      safeParseInt,
      Math.floor((Date.now() + 1000 * 60 * 60 * 24 * 30) / 1000),
    )
    .option("-t --test", "Flag to create this wallet jwt in test mode.", false)
    .option(
      "-p, --extra-props  <value>",
      'Extra JWT claim properties to add in json. For example: \'{"foo": "bar"}\'',
    )
    .action((options) => {
      main(options, createWalletJwt, true).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const createDeployAndInitWalletCmd = new Command("create-and-init-wallet")
    .description(
      "Create, deploy, and initialize a new wallet. Will print out all relevant keys, etc.",
    )
    .option("-u, --user-id  <value>", "The user ID for the wallet.")
    .option(
      "-e, --expire-at <number>",
      "The jwt expiration time in seconds since epoch. Defaults to 30 days from now.",
      safeParseInt,
      Math.floor((Date.now() + 1000 * 60 * 60 * 24 * 30) / 1000),
    )
    .option("-t --test", "Flag to create this wallet in test mode.", false)
    .option(
      "-p, --extra-props  <value>",
      'Extra JWT claim properties to add in json. For example: \'{"foo": "bar"}\'',
    )
    .action((options) => {
      main(options, createDeployAndInitWallet, true).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const terminateWalletCmd = new Command("terminate-wallet")
    .description("Terminate an exisiting wallet.")
    .option("-u, --user-id  <value>", "The user ID for the wallet.")
    .option(
      "-f --force",
      "Flag to force terminate the wallet without a confirmation.",
      false,
    )
    .action((options) => {
      main(options, terminateWallet, true).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  const InitEnvCmd = new Command("init-env")
    .description("Initialize your environment with required variables.")
    .option("-a --account-id <value>", "Your account ID.")
    .option("-e --env <value>", "The environment to use (prod or dev).", "prod")
    .option(
      "-k --jwt-signing-key <value>",
      "Your JWT-signing private key (optional).",
      undefined,
    )
    .option("-j --jwt <value>", "A default wallet jwt (optional).", undefined)
    .option(
      "-w --wallet-private-key <value>",
      "Your default wallet signing private key (optional).",
      undefined,
    )
    .action((options) => {
      initEnv(options).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  new Command("lightspark-wallet")
    .description(
      "Lightspark Wallet CLI. Start by running init-env to set up your environment.",
    )
    .version(getPackageVersion())
    .addCommand(createInvoiceCmd)
    .addCommand(createTestModeInvoiceCmd)
    .addCommand(recentTxCmd)
    .addCommand(balancesCmd)
    .addCommand(recentInvoicesCmd)
    .addCommand(l1FeeEstimateCmd)
    .addCommand(walletDashboardCmd)
    .addCommand(currentWalletCmd)
    .addCommand(decodeInvoiceCmd)
    .addCommand(createBitcoinFundingAddressCmd)
    .addCommand(payInvoiceCmd)
    .addCommand(createTestModePaymentCmd)
    .addCommand(createWalletJwtCmd)
    .addCommand(createDeployAndInitWalletCmd)
    .addCommand(terminateWalletCmd)
    .addCommand(InitEnvCmd)
    .addHelpCommand()
    .parse(process.argv);
})();

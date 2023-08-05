#!/usr/bin/env node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { input } from "@inquirer/prompts";
import {
  AccountTokenAuthProvider,
  BitcoinNetwork,
  InvoiceType,
  LightsparkClient,
} from "@lightsparkdev/lightspark-sdk";
import type { OptionValues } from "commander";
import { Command, InvalidArgumentError } from "commander";
import * as fs from "fs/promises";
import qrcode from "qrcode-terminal";
import type { EnvCredentials } from "./authHelpers.js";
import { getCredentialsFromEnvOrThrow } from "./authHelpers.js";

const main = async (
  options: OptionValues,
  action: (
    nodeId: string,
    client: LightsparkClient,
    options: OptionValues,
    credentials?: EnvCredentials
  ) => Promise<unknown>
) => {
  const credentials = getCredentialsFromEnvOrThrow();
  const client = new LightsparkClient(
    new AccountTokenAuthProvider(
      credentials.apiTokenClientId,
      credentials.apiTokenClientSecret
    ),
    credentials.baseUrl
  );
  const account = await client.getCurrentAccount();
  if (!account) {
    throw new Error("Failed to get current account");
  }
  const nodeId = (await account.getNodes(client)).entities[0].id;
  await action(nodeId, client, options, credentials);
};

const initEnv = async (options: OptionValues) => {
  let clientId = options.clientId;
  let clientSecret = options.clientSecret;
  if (!clientId) {
    clientId = await input({
      message:
        "What is your API token's client ID (ex: 018578a7e83d4f690040533eddb98b15)?",
      validate: (value) => value.length === 32,
    });
  }
  if (!clientSecret) {
    clientSecret = await input({
      message: "What is your API token's client secret?",
      validate: (value) => value.length === 43,
    });
  }

  const filePath = process.env.HOME + "/.lightsparkapienv";
  const backupFilePath = process.env.HOME + "/.lightsparkapienv-backup";
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

  let content = `export LIGHTSPARK_API_TOKEN_CLIENT_ID="${clientId}"\n`;
  content += `export LIGHTSPARK_API_TOKEN_CLIENT_SECRET="${clientSecret}"\n`;
  if (options.env === "dev") {
    content += `export LIGHTSPARK_EXAMPLE_BASE_URL="api.dev.dev.sparkinfra.net"\n`;
  }
  await fs.writeFile(filePath, content);

  console.log("Wrote environment variables to " + filePath);
  console.log("Run `source " + filePath + "` to load them into your shell");
  console.log(
    "To add them to your shell permanently, add the above line to your shell's startup script"
  );
  console.log("You can now run `lightspark` to interact with your wallet");
};

const createInvoice = async (
  nodeId: string,
  client: LightsparkClient,
  options: OptionValues
) => {
  let { amount, memo, amp } = options;
  if (!amount) {
    amount = await input({
      message: "What is the amount in SATs?",
      validate: (value) => Number.isInteger(Number(value)),
    });
  }
  if (!memo) {
    memo = await input({
      message: "What is the memo?",
    });
  }
  if (!amp) {
    const ampYn = await input({
      message: "Is this an AMP invoice (Y/n)?:",
      validate: (value) =>
        !value || value.toLowerCase() === "y" || value.toLowerCase() === "n",
    });
    amp = ampYn.toLowerCase() === "y";
  }
  console.log(
    "Creating an invoice with options: ",
    JSON.stringify({ amount, memo, amp }, null, 2),
    "\n"
  );
  const encodedInvoice = await client.createInvoice(
    nodeId,
    Number(amount) * 1000,
    memo,
    amp ? InvoiceType.AMP : InvoiceType.STANDARD
  );
  if (!encodedInvoice) {
    throw new Error("Failed to create invoice");
  }
  console.log("Encoded invoice:", encodedInvoice);
  qrcode.generate(encodedInvoice, { small: true });
};

const createTestModeInvoice = async (
  nodeId: string,
  client: LightsparkClient,
  options: OptionValues
) => {
  console.log(
    "Creating a test-mode invoice with options: ",
    JSON.stringify(options, null, 2),
    "\n"
  );
  const encodedInvoice = await client.createTestModeInvoice(
    nodeId,
    options.amount * 1000,
    options.memo
  );
  if (!encodedInvoice) {
    throw new Error("Failed to create invoice");
  }
  console.log("Encoded invoice:", encodedInvoice);
  qrcode.generate(encodedInvoice, { small: true });
};

const transactions = async (
  nodeId: string,
  client: LightsparkClient,
  options: OptionValues
) => {
  console.log(
    "Fetching transactions with options: ",
    JSON.stringify(options, null, 2),
    "\n"
  );
  const account = await client.getCurrentAccount();
  if (!account) {
    throw new Error("Failed to get current account");
  }
  const transactionList = await account.getTransactions(client, options.count);
  console.log(
    "Transactions:",
    JSON.stringify(transactionList?.entities, null, 2)
  );
};

const invoices = async (
  nodeId: string,
  client: LightsparkClient,
  options: OptionValues
) => {
  console.log(
    "Fetching payment requests with options: ",
    JSON.stringify(options, null, 2),
    "\n"
  );
  const account = await client.getCurrentAccount();
  if (!account) {
    throw new Error("Failed to get current account");
  }
  const paymentRequests = await account.getPaymentRequests(
    client,
    options.count
  );
  console.log(
    "paymentRequests:",
    JSON.stringify(paymentRequests?.entities, null, 2)
  );
};

const balances = async (
  nodeId: string,
  client: LightsparkClient /* options: OptionValues */
) => {
  console.log("Fetching account balances...\n");
  const account = await client.getCurrentAccount();
  if (!account) {
    throw new Error("Failed to get current account");
  }
  const localBalance = await account.getLocalBalance(client);
  const remoteBalance = await account.getRemoteBalance(client);
  console.log(
    "Balances:",
    JSON.stringify({ localBalance, remoteBalance }, null, 2)
  );
};

const l1FeeEstimate = async (
  nodeId: string,
  client: LightsparkClient
  /* options: OptionValues */
) => {
  console.log("Fetching bitcoin L1 fee estimate...\n");
  const feeEstimate = await client.getBitcoinFeeEstimate();
  console.log("Fee estimates:", JSON.stringify(feeEstimate, null, 2));
};

const accountDashboard = async (
  nodeId: string,
  client: LightsparkClient
  /* options: OptionValues */
) => {
  console.log("Fetching account dashboard...\n");
  const dashboard = await client.getAccountDashboard(
    undefined,
    BitcoinNetwork.REGTEST
  );
  console.log("Dashboard:", JSON.stringify(dashboard, null, 2));
};

const singleNodeDashboard = async (
  nodeId: string,
  client: LightsparkClient
  /* options: OptionValues */
) => {
  console.log("Fetching single node dashboard...\n");
  const dashboard = await client.getSingleNodeDashboard(
    nodeId,
    BitcoinNetwork.REGTEST
  );
  console.log("Dashboard:", JSON.stringify(dashboard, null, 2));
};

const currentAccount = async (
  nodeId: string,
  client: LightsparkClient
  /* options: OptionValues */
) => {
  console.log("Fetching current account...\n");
  const account = await client.getCurrentAccount();
  console.log("Account:", JSON.stringify(account, null, 2));
};

const decodeInvoice = async (
  nodeId: string,
  client: LightsparkClient,
  options: OptionValues
) => {
  let encodedInvoice = options.invoice;
  if (!encodedInvoice) {
    encodedInvoice = await input({
      message: "What is the encoded invoice?",
      validate: (value) => value.length > 0,
    });
  }
  console.log("Decoding invoice...\n");
  const decodedInvoice = await client.decodeInvoice(encodedInvoice);
  console.log("Decoded invoice:", JSON.stringify(decodedInvoice, null, 2));
};

const createNodeWalletAddress = async (
  nodeId: string,
  client: LightsparkClient
  /* options: OptionValues */
) => {
  console.log(`Creating bitcoin funding address for node ${nodeId}...\n`);
  const address = await client.createNodeWalletAddress(nodeId);
  console.log("Address:", address);
};

const payInvoice = async (
  nodeId: string,
  client: LightsparkClient,
  options: OptionValues,
  credentials?: EnvCredentials
) => {
  let encodedInvoice = options.invoice;
  if (!encodedInvoice) {
    encodedInvoice = await input({
      message: "What is the encoded invoice?",
      validate: (value) => value.length > 0,
    });
  }

  console.log(
    "Paying invoice with options: ",
    JSON.stringify({ ...options, invoice: encodedInvoice }, null, 2),
    "\n"
  );
  const nodePassword = credentials?.nodePassword;
  if (!nodePassword) {
    throw new Error("Node password not found in environment.");
  }

  await client.unlockNode(nodeId, nodePassword);
  const payment = await client.payInvoice(
    nodeId,
    encodedInvoice,
    1_000_000,
    60, // Default
    options.amount === -1 ? undefined : options.amount * 1000
  );
  console.log("Payment:", JSON.stringify(payment, null, 2));
};

const createTestModePayment = async (
  nodeId: string,
  client: LightsparkClient,
  options: OptionValues,
  credentials?: EnvCredentials
) => {
  let encodedInvoice = options.invoice;
  if (!encodedInvoice) {
    encodedInvoice = await input({
      message: "What is the encoded invoice?",
      validate: (value) => value.length > 0,
    });
  }

  console.log("Paying invoice...\n");
  const nodePassword = credentials?.nodePassword;
  if (!nodePassword) {
    throw new Error("Node password not found in environment.");
  }

  await client.unlockNode(nodeId, nodePassword);
  const payment = await client.createTestModePayment(
    nodeId,
    encodedInvoice,
    options.amount === -1 ? undefined : options.amount * 1000
  );
  console.log("Payment:", JSON.stringify(payment, null, 2));
};

const getNodeChannels = async (
  nodeId: string,
  client: LightsparkClient
  /* options: OptionValues */
) => {
  const account = await client.getCurrentAccount();
  console.log("Got account:", JSON.stringify(account, null, 2));

  const nodes = await account!.getNodes(client, 100, [BitcoinNetwork.REGTEST]);
  console.log("Got nodes:", JSON.stringify(nodes, null, 2));

  const channels = await nodes.entities[0].getChannels(client, 20);
  console.log("Got channels:", JSON.stringify(channels, null, 2));
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
    .description("Create an invoice for your account")
    .option(
      "-m, --memo  <value>",
      "Add a memo describing the invoice.",
      undefined
    )
    .option(
      "-a, --amount <number>",
      "The amount of the invoice in sats.",
      safeParseInt,
      0
    )
    .option("--amp", "Flag to use AMP invoices.", false)
    .action((options) => {
      main(options, createInvoice).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const createTestModeInvoiceCmd = new Command("create-test-mode-invoice")
    .description("Create an invoice that you can pay in test mode.")
    .option(
      "-m, --memo  <value>",
      "Add a memo describing the invoice.",
      undefined
    )
    .option(
      "-a, --amount <number>",
      "The amount of the invoice in sats.",
      safeParseInt,
      0
    )
    .action((options) => {
      main(options, createTestModeInvoice).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const recentTxCmd = new Command("transactions")
    .description("Get recent transactions for your account")
    .option(
      "-n, --count  <number>",
      "Max number of transactions to fetch.",
      safeParseInt,
      25
    )
    .action((options) => {
      main(options, transactions).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const recentInvoicesCmd = new Command("invoices")
    .description("Get recent payment requests from your account")
    .option(
      "-n, --count  <number>",
      "Max number of invoices to fetch.",
      safeParseInt,
      25
    )
    .action((options) => {
      main(options, invoices).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const decodeInvoiceCmd = new Command("decode-invoice")
    .description("Decode an encoded payment request")
    .option("-i, --invoice  <value>", "The encoded payment request.")
    .action((options) => {
      main(options, decodeInvoice).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const balancesCmd = new Command("balances")
    .description("Get balances for your account")
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

  const accountDashboardCmd = new Command("account-dashboard")
    .description("Get account dashboard")
    .action((options) => {
      main(options, accountDashboard).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const singleNodeDashboardCmd = new Command("single-node-dashboard")
    .description("Get a single node's dashboard")
    .action((options) => {
      main(options, singleNodeDashboard).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const currentAccountCmd = new Command("account")
    .description("Get current account")
    .action((options) => {
      main(options, currentAccount).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const createNodeWalletAddressCmd = new Command("funding-address")
    .description("Create a bitcoin funding address for your account.")
    .action((options) => {
      main(options, createNodeWalletAddress).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const payInvoiceCmd = new Command("pay-invoice")
    .description("Pay an invoice from your account.")
    .option("-i, --invoice  <value>", "The encoded payment request.")
    .option(
      "-a, --amount <number>",
      "The amount to pay in sats.",
      safeParseInt,
      -1
    )
    .action((options) => {
      main(options, payInvoice).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const createTestModePaymentCmd = new Command("create-test-mode-payment")
    .description(
      "In test mode, simulates a payment from another node to an invoice."
    )
    .option("-i, --invoice  <value>", "The encoded payment request.")
    .option(
      "-a, --amount <number>",
      "The amount to pay in sats.",
      safeParseInt,
      -1
    )
    .action((options) => {
      main(options, createTestModePayment).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const getNodeChannelsCmd = new Command("node-channels")
    .description("Gets node channels.")
    .action((options) => {
      main(options, getNodeChannels).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const InitEnvCmd = new Command("init-env")
    .description("Initialize your environment with required variables.")
    .option("-c --client-id <value>", "Your client ID.")
    .option("-s --client-secret <value>", "Your client secret.", undefined)
    .option("-e --env <value>", "The environment to use (prod or dev).", "prod")
    .action((options) => {
      initEnv(options).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  new Command("lightspark")
    .description(
      "Lightspark API CLI. Start by running init-env to set up your environment."
    )
    .version("1.0.0")
    .addCommand(createInvoiceCmd)
    .addCommand(createTestModeInvoiceCmd)
    .addCommand(recentTxCmd)
    .addCommand(balancesCmd)
    .addCommand(recentInvoicesCmd)
    .addCommand(l1FeeEstimateCmd)
    .addCommand(accountDashboardCmd)
    .addCommand(singleNodeDashboardCmd)
    .addCommand(currentAccountCmd)
    .addCommand(decodeInvoiceCmd)
    .addCommand(createNodeWalletAddressCmd)
    .addCommand(payInvoiceCmd)
    .addCommand(createTestModePaymentCmd)
    .addCommand(getNodeChannelsCmd)
    .addCommand(InitEnvCmd)
    .addHelpCommand()
    .parse(process.argv);
})();
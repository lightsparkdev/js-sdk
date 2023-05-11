#!/usr/bin/env ts-node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import {
  InMemoryJwtStorage,
  InvoiceType,
  LightsparkClient,
} from "@lightsparkdev/wallet-sdk";
import { Command, OptionValues } from "commander";
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
  ) => Promise<void>
) => {
  const credentials = getCredentialsFromEnvOrThrow();
  const client = new LightsparkClient(undefined, credentials.baseUrl);
  await client.loginWithJWT(
    credentials.accountId,
    credentials.jwt,
    new InMemoryJwtStorage()
  );
  await action(client, options, credentials);
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
  const transactionList = await (
    await client.getCurrentWallet()
  ).getTransactions(client, options.count);
  console.log(
    "Transactions:",
    JSON.stringify(transactionList.entities, null, 2)
  );
};

const invoices = async (client: LightsparkClient, options: OptionValues) => {
  console.log(
    "Fetching payment requests with options: ",
    JSON.stringify(options, null, 2),
    "\n"
  );
  const paymentRequests = await (
    await client.getCurrentWallet()
  ).getPaymentRequests(client, options.count);
  console.log(
    "paymentRequests:",
    JSON.stringify(paymentRequests.entities, null, 2)
  );
};

const balances = async (client: LightsparkClient, options: OptionValues) => {
  console.log("Fetching wallet balances...\n");
  const balances = (await client.getCurrentWallet()).balances;
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
  options: OptionValues
) => {
  console.log("Creating bitcoin funding address...\n");
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
  await client.loadWalletSigningKey(privateKey);
  const payment = await client.payInvoice(
    options.invoice,
    100,
    options.amount === -1 ? undefined : options.amount
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
  const claims = {
    aud: "https://api.lightspark.com",
    // Any unique identifier for the user.
    sub: options.userId,
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
};

(() => {
  const createInvoiceCmd = new Command("create-invoice")
    .description("Create an invoice for your wallet")
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
    .action((options) => {
      main(options, walletDashboard).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const currentWalletCmd = new Command("wallet")
    .description("Get current wallet")
    .action((options) => {
      main(options, currentWallet).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const createBitcoinFundingAddressCmd = new Command("funding-address")
    .description("Create a bitcoin funding address for your wallet.")
    .action((options) => {
      main(options, createBitcoinFundingAddress).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  const payInvoiceCmd = new Command("pay-invoice")
    .description("Pay an invoice from your wallet.")
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
      main(options, createWalletJwt).catch((err) =>
        console.error("Oh no, something went wrong.\n", err)
      );
    });

  new Command("Lightspark Wallet")
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
    .addHelpCommand()
    .parse(process.argv);
})();

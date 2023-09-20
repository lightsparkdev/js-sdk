// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import {
  AccountTokenAuthProvider,
  BitcoinNetwork,
  CurrencyAmount,
  getCredentialsFromEnvOrThrow,
  getDepositQuery,
  LightsparkClient,
  LightsparkNode,
  Node,
} from "@lightsparkdev/lightspark-sdk";
import day from "dayjs";
import utc from "dayjs/plugin/utc.js";

import fetch, { Headers, Request, Response } from "node-fetch";

// Need to polyfill fetch if running on node 16.
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}

day.extend(utc);

// Let's start by creating a client
const credentials = getCredentialsFromEnvOrThrow();
const client = new LightsparkClient(
  new AccountTokenAuthProvider(
    credentials.apiTokenClientId,
    credentials.apiTokenClientSecret,
  ),
  credentials.baseUrl,
);

// Get some fee estimates for Bitcoin (L1) transactions

const feeEstimate = await client.getBitcoinFeeEstimate(BitcoinNetwork.REGTEST);
console.log(
  `Fees for a fast transaction ${feeEstimate.feeFast.preferredCurrencyValueApprox} ${feeEstimate.feeFast.preferredCurrencyUnit}.`,
);
console.log(
  `Fees for a cheap transaction ${feeEstimate.feeMin.preferredCurrencyValueApprox} ${feeEstimate.feeMin.preferredCurrencyUnit}.\n`,
);

// List your account's lightning nodes

const account = await client.getCurrentAccount();
if (!account) {
  throw new Error("Unable to fetch the account.");
}
console.log(`Your account name is ${account.name}.\n`);

// Test API token logic:

const apiTokenConnection = await account.getApiTokens(client);
console.log(`You have ${apiTokenConnection.count} API tokens.`);

const { apiToken, clientSecret } = await client.createApiToken(
  "newTestToken",
  false,
  true,
);
console.log(
  `Created API token ${apiToken.name} with ID ${
    apiToken.id
  }. Permissions: ${JSON.stringify(apiToken.permissions)}\n`,
);

const apiTokenConnection2 = await account.getApiTokens(client);
console.log(`You now have ${apiTokenConnection2.count} API tokens.\n`);

client.deleteApiToken(apiToken.id);

const apiTokenConnection3 = await account.getApiTokens(client);
console.log(`You now have ${apiTokenConnection3.count} API tokens.\n`);

// Check our account's conductivity on REGTEST

console.log(
  `Your account's conductivity on REGTEST is ${await account.getConductivity(
    client,
    [BitcoinNetwork.REGTEST],
  )}/10.\n`,
);

// Check your account's local and remote balances for REGTEST
const localBalance = await account.getLocalBalance(client, [
  BitcoinNetwork.REGTEST,
]);
const remoteBalance = await account.getRemoteBalance(client, [
  BitcoinNetwork.REGTEST,
]);

if (localBalance && remoteBalance) {
  console.log(
    `Your local balance is ${localBalance.preferredCurrencyValueApprox} ${localBalance.preferredCurrencyUnit}, 
    your remote balance is ${remoteBalance.preferredCurrencyValueApprox} ${remoteBalance.preferredCurrencyUnit}.`,
  );
}

const nodesConnection = await account.getNodes(client, 50, [
  BitcoinNetwork.REGTEST,
]);

if (!nodesConnection) {
  throw new Error("Unable to fetch the nodes.");
}

console.log(`You have ${nodesConnection.count} nodes.`);

if (nodesConnection.entities.length == 0) {
  throw new Error("Cannot continue without any nodes.");
}

const nodeId = nodesConnection.entities[0].id;
const nodeName = nodesConnection.entities[0].displayName;
console.log("");

// List the transactions for our account

let transactionsConnection = await account.getTransactions(
  client,
  100,
  undefined,
  undefined,
  undefined,
  undefined,
  BitcoinNetwork.REGTEST,
);

console.log(
  `There is a total of ${transactionsConnection.count} transaction(s) on this account:`,
);
let depositTransactionId: string | undefined;
for (const transaction of transactionsConnection.entities) {
  console.log(
    `    - ${transaction.typename} at ${transaction.createdAt}:
    ${transaction.amount.preferredCurrencyValueApprox} ${transaction.amount.preferredCurrencyUnit}
    (${transaction.status})`,
  );
  if (transaction.typename == "Deposit") {
    depositTransactionId = transaction.id;
  }

  let fees;
  if (
    transaction.typename == "OutgoingPayment" ||
    transaction.typename == "Withdrawal" ||
    transaction.typename == "Deposit" ||
    transaction.typename == "ChannelOpeningTransaction" ||
    transaction.typename == "ChannelClosingTransaction"
  ) {
    fees = (transaction as unknown as { fees: CurrencyAmount }).fees;
    if (fees !== undefined)
      console.log(
        `        Paid ${fees.preferredCurrencyValueApprox} ${fees.preferredCurrencyUnit} in fees.`,
      );
  }
}
console.log("");

// Fetch transactions using pagination
const pageSize = 10;
let iterations = 0;
let hasNext = true;
let after: string | undefined = undefined;
while (hasNext && iterations < 30) {
  iterations += 1;
  transactionsConnection = await account.getTransactions(
    client,
    pageSize,
    after,
    undefined,
    undefined,
    undefined,
    BitcoinNetwork.REGTEST,
  );
  const num = transactionsConnection.entities.length;
  console.log(
    `We got ${num} transactions for the page (iteration #${iterations})`,
  );
  if (transactionsConnection.pageInfo.hasNextPage) {
    hasNext = true;
    after = transactionsConnection.pageInfo.endCursor;
    console.log("  And we have another page!");
  } else {
    hasNext = false;
    console.log("  And we're done!");
  }
}
console.log("");

// Get the transactions that happened in the past day on REGTEST

transactionsConnection = await account.getTransactions(
  client,
  undefined,
  undefined,
  undefined,
  day().utc().subtract(1, "day").format(),
  undefined,
  BitcoinNetwork.REGTEST,
);
console.log(
  `We had ${transactionsConnection.count} transactions in the past 24 hours.`,
);

// Get details for a transaction

if (!depositTransactionId) {
  throw new Error("Unable to find the deposit transaction.");
}

const deposit = await client.executeRawQuery(
  getDepositQuery(depositTransactionId),
);
console.log("Details of deposit transaction");
console.log(deposit);
console.log("");

// Generate a payment request

const invoice = await client.createInvoice(nodeId, 42000, "Pizza!");
if (!invoice) {
  throw new Error("Unable to create the invoice.");
}
console.log(`Invoice created from ${nodeName}:`);
console.log(`Encoded invoice = ${invoice}`);
console.log("");

// Decode the payment request
const decodedInvoice = await client.decodeInvoice(invoice);
if (!decodedInvoice) {
  throw new Error("Unable to decode the invoice.");
}
console.log("Decoded payment request:");
console.log(
  "    destination public key = " + decodedInvoice.destination.publicKey,
);
console.log(
  "    amount = " +
    decodedInvoice.amount.preferredCurrencyValueApprox +
    " " +
    decodedInvoice.amount.preferredCurrencyUnit,
);
console.log("    memo = " + decodedInvoice.memo);
console.log("");

// Let's send the payment.

// First, we need to recover the signing key.
await client.unlockNode(nodeId, credentials.testNodePassword!);
console.log(`${nodeName}'s signing key has been loaded.`);

// Then we can send the payment. Note that this isn't paying the invoice we just made because
// you can't actually pay your own invoice. Let's just pay a test invoice instead.
const testInvoice = await client.createTestModeInvoice(
  nodeId,
  100_000,
  "example script payment",
);
const payment = await client.payInvoice(nodeId, testInvoice, 100_000, 60);
console.log(`Payment done with ID = ${payment.id}`);
console.log("");

const address = await client.createNodeWalletAddress(nodeId);
console.log(`Got a bitcoin address for ${nodeName}: ${address}`);
console.log("");

// const withdrawal = await client.requestWithdrawal(node2Id, 1000000, address, WithdrawalMode.WALLET_THEN_CHANNELS);
// console.log(`Money was withdrawn with ID = ${withdrawal.id}`);
// console.log("");

// Fetch the channels for Node 1
const node = await client.executeRawQuery(
  LightsparkNode.getLightsparkNodeQuery(nodeId),
);
if (!node) {
  throw new Error("Unable to find node.");
}

const channelsConnection = await node.getChannels(client, 10);
console.log(`${nodeName} has ${channelsConnection.count} channel(s):`);
for (const channel of channelsConnection.entities) {
  if (channel.remoteNodeId) {
    const remoteNode = await client.executeRawQuery(
      Node.getNodeQuery(channel.remoteNodeId),
    );
    const alias = remoteNode?.alias ?? "UNKNOWN";
    if (channel.localBalance && channel.remoteBalance) {
      console.log(
        `    - With ${alias}. Local/remote balance = ${channel.localBalance.preferredCurrencyValueApprox} ${channel.localBalance.preferredCurrencyUnit}
        / ${channel.remoteBalance.preferredCurrencyValueApprox} ${channel.remoteBalance.preferredCurrencyUnit}`,
      );
    }
  }
}

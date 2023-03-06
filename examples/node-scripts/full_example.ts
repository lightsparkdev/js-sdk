import { LightsparkClient } from "@lightsparkdev/js-sdk";
import { AccountTokenAuthProvider } from "@lightsparkdev/js-sdk/auth";
import {
  BitcoinNetwork,
  CurrencyAmount,
  CurrencyUnit,
  getDepositQuery,
  LightsparkNode,
  Node,
} from "@lightsparkdev/js-sdk/objects";
import day from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { getCredentialsFromEnvOrThrow } from "./authHelpers.js";

day.extend(utc);

// Let's start by creating a client
const credentials = getCredentialsFromEnvOrThrow();
const client = new LightsparkClient(
  new AccountTokenAuthProvider(credentials.clientId, credentials.clientSecret),
  "api.dev.dev.sparkinfra.net"
);

// Get some fee estimates for Bitcoin (L1) transactions

const feeEstimate = await client.getFeeEstimate(BitcoinNetwork.REGTEST);
console.log(
  `Fees for a fast transaction ${feeEstimate.feeFast.value} ${feeEstimate.feeFast.unit}.`
);
console.log(
  `Fees for a cheap transaction ${feeEstimate.feeMin.value} ${feeEstimate.feeMin.unit}.\n`
);

// List your account's lightning nodes

const account = await client.getCurrentAccount();
if (!account) {
  throw new Error("Unable to fetch the account.");
}
console.log(`Your account name is ${account.name}.\n`);

// Check our account's conductivity on REGTEST

console.log(
  `Your account's conductivity on REGTEST is ${await account.getConductivity(
    client,
    [BitcoinNetwork.REGTEST]
  )}/10.\n`
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
    `Your local balance is ${localBalance.value} ${localBalance.unit}, your remote balance is ${remoteBalance.value} ${remoteBalance.unit}.`
  );
}

const nodesConnection = await account.getNodes(client, 59, [
  BitcoinNetwork.REGTEST,
]);

if (!nodesConnection) {
  throw new Error("Unable to fetch the nodes.");
}

console.log(`You have ${nodesConnection.count} nodes.`);

let node1Id: string | undefined;
let node2Id: string | undefined;

for (const node of nodesConnection.entities) {
  if (node) {
    console.log(`    - ${node.name} (${node.status})`);
    if (node.name == credentials.node1Name) node1Id = node.id;
    else if (node.name == credentials.node2Name) node2Id = node.id;
  }
}
console.log("");

if (!node1Id || !node2Id) {
  throw new Error("Unable to find the nodes.");
}

// List the transactions for our account

let transactionsConnection = await account.getTransactions(
  client,
  30,
  undefined,
  undefined,
  undefined,
  undefined,
  BitcoinNetwork.REGTEST
);

console.log(
  `There is a total of ${transactionsConnection.count} transaction(s) on this account:`
);
let depositTransactionId: string | undefined;
for (const transaction of transactionsConnection.entities) {
  console.log(
    `    - ${transaction.typename} at ${transaction.createdAt}: ${transaction.amount.value} ${transaction.amount.unit} (${transaction.status})`
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
      console.log(`        Paid ${fees.value} ${fees.unit.name} in fees.`);
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
    BitcoinNetwork.REGTEST
  );
  const num = transactionsConnection.entities.length;
  console.log(
    `We got ${num} transactions for the page (iteration #${iterations})`
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
  BitcoinNetwork.REGTEST
);
console.log(
  `We had ${transactionsConnection.count} transactions in the past 24 hours.`
);

// Get details for a transaction

if (!depositTransactionId) {
  throw new Error("Unable to find the deposit transaction.");
}

const deposit = await client.executeRawQuery(
  getDepositQuery(depositTransactionId)
);
console.log("Details of deposit transaction");
console.log(deposit);
console.log("");

// Generate a payment request

const invoice = await client.createInvoice(
  node1Id,
  { value: 42, unit: CurrencyUnit.SATOSHI },
  "Pizza!"
);
if (!invoice) {
  throw new Error("Unable to create the invoice.");
}
console.log(`Invoice created from ${credentials.node1Name}:`);
console.log(`Encoded invoice = ${invoice}`);
console.log("");

// Decode the payment request
const decodedInvoice = await client.decodeInvoice(invoice);
if (!decodedInvoice) {
  throw new Error("Unable to decode the invoice.");
}
console.log("Decoded payment request:");
console.log(
  "    destination public key = " + decodedInvoice.destination.publicKey
);
console.log(
  "    amount = " +
    decodedInvoice.amount.value +
    " " +
    decodedInvoice.amount.unit
);
console.log("    memo = " + decodedInvoice.memo);
console.log("");

// Let's send the payment.

// First, we need to recover the signing key.
await client.unlockNode(node2Id, credentials.node2Password!);
console.log(`${credentials.node2Name}'s signing key has been loaded.`);

// Then we can send the payment
const payment = await client.payInvoice(node2Id, invoice, 60, null, {
  value: 500,
  unit: CurrencyUnit.SATOSHI,
});
console.log(`Payment done with ID = ${payment.id}`);
console.log("");

const address = await client.createNodeWalletAddress(node1Id);
console.log(`Got a bitcoin address for ${credentials.node1Name}: ${address}`);
console.log("");

const withdrawal = await client.withdrawFunds(node2Id, address, {
  value: 1000,
  unit: CurrencyUnit.SATOSHI,
});
console.log(`Money was withdrawn with ID = ${withdrawal.id}`);
console.log("");

// Fetch the channels for Node 1
const node1 = await client.executeRawQuery(
  LightsparkNode.getLightsparkNodeQuery(node1Id)
);
if (!node1) {
  throw new Error("Unable to find node 1.");
}

const channelsConnection = await node1.getChannels(client, 10);
console.log(
  `${credentials.node1Name} has ${channelsConnection.count} channel(s):`
);
for (const channel of channelsConnection.entities) {
  if (channel.remoteNodeId) {
    const remoteNode = await client.executeRawQuery(
      Node.getNodeQuery(channel.remoteNodeId)
    );
    const alias = remoteNode?.alias ?? "UNKNOWN";
    if (channel.localBalance && channel.remoteBalance) {
      console.log(
        `    - With ${alias}. Local/remote balance = ${channel.localBalance.value} ${channel.localBalance.unit}/${channel.remoteBalance.value} ${channel.remoteBalance.unit}`
      );
    }
  }
}
console.log("");

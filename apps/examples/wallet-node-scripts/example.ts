// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { KeyOrAlias } from "@lightsparkdev/core";
import {
  CurrencyAmount,
  getTransactionQuery,
  InMemoryJwtStorage,
  LightsparkClient,
} from "@lightsparkdev/wallet-sdk";
import day from "dayjs";
import utc from "dayjs/plugin/utc.js";

import { getCredentialsFromEnvOrThrow } from "./authHelpers.js";

day.extend(utc);

// Let's start by creating a client
const credentials = getCredentialsFromEnvOrThrow();
const client = new LightsparkClient(undefined, credentials.baseUrl);
await client.loginWithJWT(
  credentials.accountId,
  credentials.jwt,
  new InMemoryJwtStorage()
);

// Get some fee estimates for Bitcoin (L1) transactions

const feeEstimate = await client.getBitcoinFeeEstimate();
console.log(
  `Fees for a fast transaction ${feeEstimate.feeFast.preferredCurrencyValueApprox} ${feeEstimate.feeFast.preferredCurrencyUnit}.`
);
console.log(
  `Fees for a cheap transaction ${feeEstimate.feeMin.preferredCurrencyValueApprox} ${feeEstimate.feeMin.preferredCurrencyUnit}.\n`
);

// Get your current wallet.

const wallet = await client.getCurrentWallet();
if (!wallet) {
  throw new Error("Unable to fetch the wallet.");
}
console.log(`Current wallet: ${JSON.stringify(wallet, undefined, 2)}.\n`);

// List the payment requests for our wallet.

let paymentRequestsConnection = await wallet.getPaymentRequests(
  client,
  100,
  undefined,
  undefined,
  undefined
);

console.log(
  `There is a total of ${paymentRequestsConnection.count} payment request(s) on this wallet.`
);

// List the transactions for our wallet.

let transactionsConnection = await wallet.getTransactions(
  client,
  100,
  undefined,
  undefined,
  undefined
);

console.log(
  `There is a total of ${transactionsConnection.count} transaction(s) on this wallet:`
);
for (const transaction of transactionsConnection.entities) {
  console.log(
    `    - ${transaction.typename} at ${transaction.createdAt}:
    ${transaction.amount.preferredCurrencyValueApprox} ${transaction.amount.preferredCurrencyUnit}
    (${transaction.status})`
  );

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
        `        Paid ${fees.preferredCurrencyValueApprox} ${fees.preferredCurrencyUnit} in fees.`
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
  transactionsConnection = await wallet.getTransactions(
    client,
    pageSize,
    after,
    undefined,
    undefined,
    undefined
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

// Get the transactions that happened in the past day.

const lastDayTransactionsConnection = await wallet.getTransactions(
  client,
  undefined,
  undefined,
  undefined,
  day().utc().subtract(1, "day").format(),
  undefined
);
console.log(
  `We had ${lastDayTransactionsConnection.count} transactions in the past 24 hours.`
);

// Get details for a transaction
if (transactionsConnection.entities.length > 0) {
  const transaction = await client.executeRawQuery(
    getTransactionQuery(transactionsConnection.entities[0].id)
  );
  console.log("Details of transaction");
  console.log(JSON.stringify(transaction, undefined, 2));
  console.log("");
}

// Generate a payment request

const invoice = await client.createInvoice(42000, "Pizza!");
if (!invoice) {
  throw new Error("Unable to create the invoice.");
}
console.log(`Invoice created: ${JSON.stringify(invoice, undefined, 2)}`);

// Decode the payment request
const decodedInvoice = await client.decodeInvoice(
  invoice.encodedPaymentRequest
);
if (!decodedInvoice) {
  throw new Error("Unable to decode the invoice.");
}
console.log(
  `Decoded payment request: ${JSON.stringify(decodedInvoice, undefined, 2)}`
);

// Let's send the payment.

// First, we need to unlock the wallet. Check we have loaded the signing key in the environment.
const signingPrivateKey = credentials.privKey;
if (!signingPrivateKey) {
  throw new Error(
    "Missing signing key in the environment. Please set LIGHTSPARK_WALLET_PUB_KEY and LIGHTSPARK_WALLET_PRIV_KEY."
  );
}
await client.loadWalletSigningKey(KeyOrAlias.key(signingPrivateKey));
console.log(`Wallet signing key has been loaded.`);

// Then we can send the payment. Note that this isn't paying the invoice we just made because
// you can't actually pay your own invoice. Let's just pay a pre-existing AMP invoice instead.
const ampInvoice =
  "lnbcrt1pjr8xwypp5xqj2jfpkz095s8zu57ktsq8vt8yazwcmqpcke9pvl67ne9cpdr0qdqj2a5xzumnwd6hqurswqcqzpgxq9z0rgqsp55hfn0caa5sexea8u979cckkmwelw6h3zpwel5l8tn8s0elgwajss9q8pqqqssqefmmw79tknhl5xhnh7yfepzypxknwr9r4ya7ueqa6vz20axvys8se986hwj6gppeyzst44hm4yl04c4dqjjpqgtt0df254q087sjtfsq35yagj";
const payment = await client.payInvoiceAndAwaitResult(ampInvoice, 1_000_000, 100_000);
console.log(`Payment done with status= ${payment.status}, ID = ${payment.id}`);
console.log("");

const address = await client.createBitcoinFundingAddress();
console.log(`Got a bitcoin address for the wallet: ${address}`);
console.log("");

// Withdrawals don't work in test mode, but you can try it in production like:
// const withdrawal = await client.requestWithdrawal(1000000, address);
// console.log(`Money was withdrawn with ID = ${withdrawal.id}`);
// console.log("");

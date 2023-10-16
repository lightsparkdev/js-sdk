#!/usr/bin/env ts-node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import {
  AccountTokenAuthProvider,
  BitcoinNetwork,
  getCredentialsFromEnvOrThrow,
  LightsparkClient,
} from "@lightsparkdev/lightspark-sdk";
import { Command } from "commander";

const main = async (program: Command) => {
  const credentials = getCredentialsFromEnvOrThrow();
  const client = new LightsparkClient(
    new AccountTokenAuthProvider(
      credentials.apiTokenClientId,
      credentials.apiTokenClientSecret,
    ),
    credentials.baseUrl,
  );
  const account = await client.getCurrentAccount();
  const nodeId = (await account.getNodes(client)).entities.find(
    (node) => node.bitcoinNetwork === BitcoinNetwork.REGTEST,
  )?.id;
  const options = program.opts();
  console.log("Options: ", JSON.stringify(options, null, 2));
  const metadata = [
    ["text/plain", `Pay someone on Lightspark`],
    ["text/identifier", `someone@domain.org`],
  ];
  const invoice = await client.createLnurlInvoice(
    nodeId,
    options.amount * 1000,
    JSON.stringify(metadata),
  );
  console.log("Invoice:", JSON.stringify(invoice, null, 2));
  console.log("Simulating payment...");
  const incomingPayment = await client.createTestModePayment(
    nodeId,
    invoice.data.encodedPaymentRequest,
  );
  console.log("Incoming payment:", JSON.stringify(incomingPayment, null, 2));
};

(() => {
  const program = new Command();
  program
    .name("CreateLnurlInvoice")
    .version("1.0.0")
    .description("Create an LNURL invoice for your lightning node.")
    .option(
      "-a, --amount <number>",
      "The amount of the invoice in sats.",
      parseInt,
      0,
    )
    .parse(process.argv);

  const options = program.opts();
  if (options.amount === undefined) {
    program.outputHelp();
  } else {
    // tslint:disable-next-line
    main(program).catch((err) =>
      console.error("Oh no, something went wrong.\n", err),
    );
  }
})();

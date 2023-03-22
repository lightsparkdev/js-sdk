#!/usr/bin/env ts-node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkClient } from "@lightsparkdev/js-sdk";
import { AccountTokenAuthProvider } from "@lightsparkdev/js-sdk/auth";
import { CurrencyUnit, InvoiceType } from "@lightsparkdev/js-sdk/objects";
import { Command } from "commander";

import { getCredentialsFromEnvOrThrow } from "./authHelpers.js";

const main = async (program: Command) => {
  const account = getCredentialsFromEnvOrThrow();
  const client = new LightsparkClient(
    new AccountTokenAuthProvider(account.clientId, account.clientSecret)
  );
  const options = program.opts();
  console.log("Options: ", JSON.stringify(options, null, 2));
  const invoice = await client.createInvoice(
    account.walletNodeId,
    { value: options.amount, unit: CurrencyUnit.SATOSHI },
    options.memo,
    options.amp ? InvoiceType.AMP : InvoiceType.STANDARD
  );
  console.log("Invoice:", JSON.stringify(invoice, null, 2));
};

(() => {
  const program = new Command();
  program
    .name("CreateInvoice")
    .version("1.0.0")
    .description("Create an invoice for your wallet node")
    .option(
      "-m, --memo  <value>",
      "Add a memo describing the invoice.",
      undefined
    )
    .option("-a, --amount <number>", "The amount of the invoice.", parseInt, 0)
    .option("--amp", "Flag to use AMP invoices.", false)
    .parse(process.argv);

  const options = program.opts();
  if (!options.amount) {
    program.outputHelp();
  } else {
    // tslint:disable-next-line
    main(program).catch((err) =>
      console.error("Oh no, something went wrong.\n", err)
    );
  }
})();

#!/usr/bin/env ts-node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import {
  InMemoryTokenStorage,
  InvoiceType,
  LightsparkClient,
} from "@lightsparkdev/wallet-sdk";
import { getCredentialsFromEnvOrThrow } from "@lightsparkdev/wallet-sdk/env";
import { Command } from "commander";
import { isObject } from "lodash-es";

function validateOptions(options: unknown) {
  if (!isObject(options)) {
    throw new Error("Options must be an object");
  }

  const validOpts = {
    amount: 0,
    memo: "",
    amp: false,
    expirySec: undefined as number | undefined,
  };

  if ("amount" in options && typeof options.amount === "number") {
    validOpts.amount = options.amount;
  }
  if ("memo" in options && typeof options.memo === "string") {
    validOpts.memo = options.memo;
  }
  if ("amp" in options && typeof options.amp === "boolean") {
    validOpts.amp = options.amp;
  }
  if ("expirySec" in options && typeof options.expirySec === "number") {
    validOpts.expirySec = options.expirySec;
  }

  return validOpts;
}

const main = async (program: Command) => {
  const credentials = getCredentialsFromEnvOrThrow();
  const client = new LightsparkClient(undefined, credentials.baseUrl);
  await client.loginWithJWT(
    credentials.accountId,
    credentials.jwt,
    new InMemoryTokenStorage(),
  );
  const options = program.opts();
  console.log("Options: ", JSON.stringify(options, null, 2));
  const opts = validateOptions(options);
  const invoice = await client.createInvoice(
    opts.amount * 1000,
    opts.memo,
    opts.amp ? InvoiceType.AMP : InvoiceType.STANDARD,
    opts.expirySec,
  );
  console.log("Invoice:", JSON.stringify(invoice, null, 2));
};

(() => {
  const program = new Command();
  program
    .name("CreateInvoice")
    .version("1.0.0")
    .description("Create an invoice for your wallet")
    .option(
      "-m, --memo  <value>",
      "Add a memo describing the invoice.",
      undefined,
    )
    .option(
      "-a, --amount <number>",
      "The amount of the invoice in sats.",
      parseInt,
      0,
    )
    .option(
      "-e, --expiry-sec <number>",
      "The expiration duration in seconds.",
      parseInt,
      undefined,
    )
    .option("--amp", "Flag to use AMP invoices.", false)
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

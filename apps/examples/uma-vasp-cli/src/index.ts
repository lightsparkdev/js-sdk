#!/usr/bin/env node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { confirm, input, select } from "@inquirer/prompts";
import { type CurrencyAmount } from "@lightsparkdev/lightspark-sdk";
import { type Currency } from "@uma-sdk/core";
import chalk from "chalk";
import type { OptionValues } from "commander";
import { Command } from "commander";
import { getPackageVersion } from "./helpers.js";

const sendPayment = async (options: OptionValues) => {
  console.log(
    chalk.yellowBright.bold("\n⚡️ Welcome to the UMA VASP CLI! ⚡️\n"),
  );

  let { endpoint, receiverUma } = options as {
    endpoint: string;
    receiverUma: string;
  };
  if (!endpoint) {
    endpoint = process.env.UMA_VASP_ENDPOINT || "";
    if (!endpoint || endpoint.length === 0) {
      endpoint = await input({
        message: "What is the base url where the vasp is running?",
      });
    }
  }
  if (!receiverUma) {
    receiverUma = await input({
      message: "Who do you want to send to?",
    });
  }

  if (!receiverUma.startsWith("$")) {
    receiverUma = "$" + receiverUma;
  }

  if (receiverUma.split("@").length !== 2) {
    throw new Error("Invalid UMA address");
  }
  // TODO: Validate UMA address more thoroughly.

  const lnurlpResponse = await fetchLnurlp(endpoint, receiverUma);

  let currencyChoice = lnurlpResponse.receiverCurrencies[0];
  if (lnurlpResponse.receiverCurrencies.length > 1) {
    console.log(
      `\n${receiverUma} can receive:`,
      JSON.stringify(lnurlpResponse.receiverCurrencies, null, 2),
      "\n",
    );
    currencyChoice = await select({
      message: "What currency do you want to send?",
      choices: lnurlpResponse.receiverCurrencies.map((c) => {
        return { value: c, name: `${c.name} (${c.code})` };
      }),
    });
  } else {
    console.log(`\n${receiverUma} can only receive ${currencyChoice.code}.\n`);
  }

  const amountStr = await input({
    message: `How much ${currencyChoice.code} do you want to send?`,
    validate: (value) => {
      try {
        return !Number.isNaN(parseFloat(value));
      } catch (e) {
        return false;
      }
    },
  });
  const amount = Math.round(
    parseFloat(amountStr) * Math.pow(10, currencyChoice.decimals),
  );
  if (amount < currencyChoice.minSendable) {
    throw new Error(
      `Amount must be greater than ${currencyChoice.minSendable} ${currencyChoice.code}`,
    );
  }
  if (amount > currencyChoice.maxSendable) {
    throw new Error(
      `Amount must be less than ${currencyChoice.maxSendable} ${currencyChoice.code}`,
    );
  }

  console.log(
    `\nSending ${amount / Math.pow(10, currencyChoice.decimals)} ${
      currencyChoice.code
    } to ${receiverUma}...`,
  );
  console.log(
    `The estimated SAT amount is ${
      (amount * currencyChoice.multiplier) / 1000
    }`,
  );

  const payreqResponse = await fetchPayreq(
    endpoint,
    lnurlpResponse.callbackUuid,
    amount,
    currencyChoice.code,
  );

  console.log(`\nPayreq details:`);
  console.log(`- Amount: ${JSON.stringify(payreqResponse.amount, null, 2)}`);
  console.log(
    `- Exchange rate: ${payreqResponse.conversionRate} mSAT per ${currencyChoice.code}`,
  );
  console.log(
    `- Exchange fees: ${payreqResponse.exchangeFeesMillisatoshi} mSAT\n`,
  );
  const shouldPay = await confirm({
    message: "Do you want to complete payment? (y/n)",
    default: true,
  });
  if (!shouldPay) {
    console.log("Payment cancelled.");
    return;
  }

  const payResponse = await completePayment(
    endpoint,
    payreqResponse.callbackUuid,
  );
  console.log(`\nPayment: ${JSON.stringify(payResponse, null, 2)}\n`);
};

const fetchLnurlp = async (endpoint: string, receiverUma: string) => {
  const response = await fetch(`${endpoint}/api/umalookup/${receiverUma}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch lnurlp: ${response.statusText}`);
  }
  const lnurlp = (await response.json()) as {
    senderCurrencies: Currency[];
    receiverCurrencies: Currency[];
    minSendableSats: number;
    maxSendableSats: number;
    callbackUuid: string;
  };

  return lnurlp;
};

const fetchPayreq = async (
  endpoint: string,
  callbackUuid: string,
  amount: number,
  currency: string,
) => {
  const response = await fetch(
    `${endpoint}/api/umapayreq/${callbackUuid}?amount=${amount}&currencyCode=${currency}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch payreq: ${response.statusText}`);
  }
  const payreq = (await response.json()) as {
    senderCurrencies: Currency[];
    callbackUuid: string;
    encodedInvoice: string;
    amount: CurrencyAmount;
    conversionRate: number;
    exchangeFeesMillisatoshi: number;
    currencyCode: string;
  };

  return payreq;
};

const completePayment = async (endpoint: string, callbackUuid: string) => {
  const response = await fetch(`${endpoint}/api/sendpayment/${callbackUuid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to complete payment: ${response.statusText}`);
  }
  const pay = (await response.json()) as {
    paymentId: string;
    didSucceed: boolean;
  };

  return pay;
};

(() => {
  const sendPaymentCmd = new Command("send")
    .description("Send an UMA Payment")
    .option(
      "-r, --receiver-uma  <value>",
      "The UMA address of the receiver.",
      undefined,
    )
    .option(
      "-e, --endpoint  <value>",
      "The base url where the vasp is running.",
      undefined,
    )
    .action((options) => {
      sendPayment(options).catch((err) =>
        console.error("Oh no, something went wrong.\n", err),
      );
    });

  new Command("uma-vasp")
    .description("UMA VASP CLI. Run the send command to get started.")
    .version(getPackageVersion())
    .addCommand(sendPaymentCmd)
    .addHelpCommand()
    .parse(process.argv);
})();

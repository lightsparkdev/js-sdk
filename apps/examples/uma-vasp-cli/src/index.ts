#!/usr/bin/env node
// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { confirm, input, password, select } from "@inquirer/prompts";
import { type Currency } from "@uma-sdk/core";
import chalk from "chalk";
import type { OptionValues } from "commander";
import { Command } from "commander";
import { getPackageVersion } from "./helpers.js";

const sendPayment = async (options: OptionValues) => {
  console.log(
    chalk.yellowBright.bold("\n⚡️ Welcome to the UMA VASP CLI! ⚡️\n"),
  );

  let {
    endpoint,
    receiverUma,
    sendingUser,
    sendingPassword,
    lockSendingAmount,
  } = options as {
    endpoint: string;
    receiverUma: string;
    sendingUser: string | undefined;
    sendingPassword: string | undefined;
    lockSendingAmount: boolean | undefined;
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
    console.log("Not an UMA user, falling back to LNURL.");
  }

  if (receiverUma.split("@").length !== 2) {
    throw new Error("Invalid UMA address");
  }
  // TODO: Validate UMA address more thoroughly.

  const lnurlpResponse = await fetchLnurlp(
    endpoint,
    receiverUma,
    sendingUser,
    sendingPassword,
  );

  sendingUser = lnurlpResponse.sendingUsername;
  sendingPassword = lnurlpResponse.sendingUserPassword;

  let currencyChoice = lnurlpResponse.receiverCurrencies[0];
  if (lnurlpResponse.receiverCurrencies.length > 1) {
    console.log(
      `\n${receiverUma} can receive:`,
      JSON.stringify(lnurlpResponse.receiverCurrencies, null, 2),
      "\n",
    );
    currencyChoice = await select({
      message: "What currency do you want the receiver to receive?",
      choices: lnurlpResponse.receiverCurrencies.map((c) => {
        return { value: c, name: `${c.name} (${c.code})` };
      }),
    });
  } else {
    console.log(`\n${receiverUma} can only receive ${currencyChoice.code}.\n`);
  }

  if (lockSendingAmount === undefined) {
    lockSendingAmount = !(await confirm({
      message:
        "Do you want to lock the amount the receiver receives (y) or the amount you're sending?",
      default: true,
    }));
  }

  const amountCurrencyCode = lockSendingAmount ? "sats" : currencyChoice.code;

  const amountStr = await input({
    message: `How much ${amountCurrencyCode} do you want to send?`,
    validate: (value) => {
      try {
        return !Number.isNaN(parseFloat(value));
      } catch (e) {
        return false;
      }
    },
  });
  const amount = lockSendingAmount
    ? Math.round(parseFloat(amountStr) * 1000)
    : Math.round(parseFloat(amountStr) * Math.pow(10, currencyChoice.decimals));

  if (lockSendingAmount) {
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
  } else {
    if (amount < lnurlpResponse.minSendableSats) {
      throw new Error(
        `Amount must be greater than ${lnurlpResponse.minSendableSats} sats`,
      );
    }

    if (amount > lnurlpResponse.maxSendableSats) {
      throw new Error(
        `Amount must be less than ${lnurlpResponse.maxSendableSats} sats`,
      );
    }

    console.log(`\nSending ${amount} sats to ${receiverUma}...`);

    console.log(
      `The estimated ${currencyChoice.code} amount is ${
        (amount * 1000) / currencyChoice.multiplier
      }`,
    );
  }

  const payreqResponse = await fetchPayreq(
    endpoint,
    lnurlpResponse.callbackUuid,
    amount,
    currencyChoice.code,
    lockSendingAmount,
    sendingUser,
    sendingPassword,
  );

  console.log(`\nPayreq details:`);
  console.log(
    `- Amount: ${payreqResponse.amountReceivingCurrency} ${currencyChoice.code} (${payreqResponse.amountMsats} mSAT)`,
  );
  console.log(
    `- Exchange rate: ${payreqResponse.conversionRate} mSAT per ${currencyChoice.code}`,
  );
  console.log(`- Exchange fees: ${payreqResponse.exchangeFeesMsats} mSAT\n`);
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
    sendingUser,
    sendingPassword,
  );
  console.log(`\nPayment: ${JSON.stringify(payResponse, null, 2)}\n`);
};

type LookupResponse = {
  senderCurrencies: Currency[];
  receiverCurrencies: Currency[];
  minSendableSats: number;
  maxSendableSats: number;
  callbackUuid: string;
  sendingUsername?: string;
  sendingUserPassword?: string;
};

const fetchLnurlp = async (
  endpoint: string,
  receiverUma: string,
  sendingUsername: string | undefined,
  sendingUserPassword: string | undefined,
): Promise<LookupResponse> => {
  const response = await fetch(
    `${endpoint}/api/umalookup/${receiverUma}`,
    getAuthOptions(sendingUsername, sendingUserPassword),
  );
  if ((!sendingUsername || !sendingUserPassword) && response.status === 401) {
    const username = await input({
      message: "The sending vasp requires auth. What is your username?",
    });
    const pass = await password({
      message: "What is your password?",
    });
    return fetchLnurlp(endpoint, receiverUma, username, pass);
  }

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

  return Object.assign(lnurlp, { sendingUsername, sendingUserPassword });
};

const fetchPayreq = async (
  endpoint: string,
  callbackUuid: string,
  amount: number,
  currency: string,
  isAmountInMsats: boolean,
  sendingUsername: string | undefined,
  sendingUserPassword: string | undefined,
) => {
  const response = await fetch(
    `${endpoint}/api/umapayreq/${callbackUuid}?amount=${amount}&receivingCurrencyCode=${currency}&isAmountInMsats=${isAmountInMsats}`,
    getAuthOptions(sendingUsername, sendingUserPassword),
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch payreq: ${response.statusText}`);
  }
  const payreq = (await response.json()) as {
    senderCurrencies: Currency[];
    callbackUuid: string;
    encodedInvoice: string;
    amountMsats: number;
    amountReceivingCurrency: number;
    conversionRate: number;
    exchangeFeesMsats: number;
    receivingCurrencyCode: string;
  };

  return payreq;
};

const completePayment = async (
  endpoint: string,
  callbackUuid: string,
  sendingUsername: string | undefined,
  sendingUserPassword: string | undefined,
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (sendingUsername && sendingUserPassword) {
    headers.Authorization = `Basic ${Buffer.from(
      `${sendingUsername}:${sendingUserPassword}`,
    ).toString("base64")}`;
  }
  const response = await fetch(`${endpoint}/api/sendpayment/${callbackUuid}`, {
    method: "POST",
    headers,
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

const getAuthOptions = (
  sendingUsername: string | undefined,
  sendingUserPassword: string | undefined,
): RequestInit | undefined => {
  if (!sendingUsername || !sendingUserPassword) {
    return undefined;
  }

  return {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${sendingUsername}:${sendingUserPassword}`,
      ).toString("base64")}`,
    },
  };
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
    .option(
      "-u, --sending-user  <value>",
      "The user name of the sending user.",
      undefined,
    )
    .option(
      "-p, --sending-password  <value>",
      "The password of the sending user if the sending vasp requires one.",
      undefined,
    )
    .option(
      "-l, --lock-sending-amount",
      "Lock the amount you're sending instead of the amount the receiver receives.",
      undefined,
    )
    .action((options: OptionValues) => {
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

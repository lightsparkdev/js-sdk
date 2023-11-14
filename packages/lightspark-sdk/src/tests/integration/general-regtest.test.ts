/**
 * To run test properly:
 * 1. Create LIGHTSPARK_API_TOKEN_CLIENT_ID and LIGHTSPARK_API_TOKEN_CLIENT_SECRET in https://app.lightspark.com/api-config
 * 2. lightspark-wallet init-env
 * 3. yarn workspace @lightsparkdev/wallet-sdk test
 */

import { describe, expect, test } from "@jest/globals";
import { mapCurrencyAmount, pollUntil, round } from "@lightsparkdev/core";
import dayjs from "dayjs";
import LightsparkClient from "../../client.js";
import { getCredentialsFromEnvOrThrow } from "../../env.js";
import { DecodeInvoice } from "../../graphql/DecodeInvoice.js";
import {
  AccountTokenAuthProvider,
  BitcoinNetwork,
  InvoiceType,
  OutgoingPayment,
  PaymentRequestStatus,
  TransactionStatus,
  type AccountToNodesConnection,
} from "../../index.js";
import { logger } from "../../logger.js";
import {
  DAY_IN_MS,
  ENCODED_REGTEST_REQUEST_FOR_TESTS,
  INVOICE_EXPIRY,
  LONG_TEST_TIMEOUT,
  MAX_FEE,
  PAGINATION_STEP,
  PAY_AMOUNT,
  REGTEST_SIGNING_KEY_PASSWORD,
  TESTS_TIMEOUT,
  TRANSACTION_WAIT_TIME,
} from "./constants.js";

const unauthorizedLightsparkClient = new LightsparkClient();

const { apiTokenClientId, apiTokenClientSecret, baseUrl } =
  getCredentialsFromEnvOrThrow();

let lightsparkClient: LightsparkClient;
let paymentInvoice: string | undefined;
let regtestNodeId: string | undefined;
let invoicePayment: OutgoingPayment | undefined;

const pollIntervalMs = 750;
const pollTimeoutSecs = 20;
const pollMaxTimeouts = (pollTimeoutSecs * 1000) / pollIntervalMs;
const pollIgnoreErrors = false;

let nodesConnection: AccountToNodesConnection | undefined;

const testModeInvoices: Record<string, string | null> = {
  withMemo: null,
  withoutMemo: null,
};

const createTestModePayment = async () => {
  const regtestNodeId = getRegtestNodeId();
  const testInvoice = await lightsparkClient.createInvoice(
    regtestNodeId,
    PAY_AMOUNT,
    "hi there!",
  );

  if (!testInvoice) {
    throw new TypeError("Test invoice wasn't created");
  }

  const payment = await lightsparkClient.createTestModePayment(
    regtestNodeId,
    testInvoice,
  );
  if (!payment) {
    throw new TypeError("Test mode payment wasn't created");
  }
  return payment;
};

const initSuiteName = "initialization";
const p0SuiteName = "p0";
const p1SuiteName = "p1";
const p2SuiteName = "p2";
function log(msg: string, ...args: unknown[]) {
  logger.info(
    `${expect
      .getState()
      .currentTestName?.replace(
        new RegExp(`^(${initSuiteName}|p[0-2])\\s`, "g"),
        "",
      )}: ${msg}`,
    ...args,
  );
}

function getRegtestNodeId() {
  expect(regtestNodeId).toBeDefined();
  if (!regtestNodeId) {
    throw new TypeError("No regtest nodes in account");
  }
  return regtestNodeId;
}

async function getAccount() {
  const account = await lightsparkClient.getCurrentAccount();
  if (!account) {
    throw new TypeError("No account");
  }
  return account;
}

async function getRegtestNode() {
  const account = await getAccount();
  const regtestNodeId = getRegtestNodeId();
  const nodesConnection = await account.getNodes(
    lightsparkClient,
    1,
    [BitcoinNetwork.REGTEST],
    [regtestNodeId],
  );
  const regtestNode = nodesConnection.entities[0];
  if (!regtestNode) {
    throw new TypeError(`No regtest node found for account ${account.id}`);
  }
  return regtestNode;
}

describe(initSuiteName, () => {
  test("should get env vars and construct the client successfully", () => {
    const accountAuthProvider = new AccountTokenAuthProvider(
      apiTokenClientId,
      apiTokenClientSecret,
    );
    lightsparkClient = new LightsparkClient(accountAuthProvider, baseUrl);
    expect(lightsparkClient).toBeDefined();
  });

  test(
    "Should successfully get the current account regtest node and set it as the default for current test suite",
    async () => {
      const account = await getAccount();
      nodesConnection = await account.getNodes(lightsparkClient, 1, [
        BitcoinNetwork.REGTEST,
      ]);

      if (!nodesConnection?.entities) {
        throw new TypeError("No connections in account");
      }

      const [regtestNode] = nodesConnection?.entities;
      regtestNodeId = regtestNode?.id;
      log("regtestNodeId", regtestNode?.id);

      await lightsparkClient.loadNodeSigningKey(getRegtestNodeId(), {
        password: REGTEST_SIGNING_KEY_PASSWORD,
      });

      expect(regtestNode).toBeDefined();
    },
    TESTS_TIMEOUT,
  );
});

describe(p0SuiteName, () => {
  test("Should create a normal payment invoice", async () => {
    paymentInvoice = await lightsparkClient.createInvoice(
      getRegtestNodeId(),
      PAY_AMOUNT,
      "hi there!",
    );
    expect(paymentInvoice).toBeDefined();
  });

  test("Should create a AMP type invoice", async () => {
    const AmpPaymentInvoice = await lightsparkClient.createInvoice(
      getRegtestNodeId(),
      PAY_AMOUNT,
      "hi there!",
      InvoiceType.AMP,
    );
    expect(AmpPaymentInvoice).toBeDefined();
  });

  test("Should create a invoice with custom expiration", async () => {
    const AmpPaymentInvoiceWithExpiration =
      await lightsparkClient.createInvoice(
        getRegtestNodeId(),
        PAY_AMOUNT,
        "hi there!",
        InvoiceType.STANDARD,
        INVOICE_EXPIRY,
      );
    expect(AmpPaymentInvoiceWithExpiration).toBeDefined();
  });

  test("Should create an invoice that allows the payer to specify any amount", async () => {
    const AnyPaymentAmountInvoice = await lightsparkClient.createInvoice(
      getRegtestNodeId(),
      0,
      "hi there!",
      InvoiceType.STANDARD,
      INVOICE_EXPIRY,
    );
    expect(AnyPaymentAmountInvoice).toBeDefined();
  });

  test("should throw an error on create an unauthorized invoice", async () => {
    await expect(
      unauthorizedLightsparkClient.createInvoice(
        getRegtestNodeId(),
        0,
        "hi there!",
      ),
    ).rejects.toThrowError();
  });

  const satsToFund = 40_000;
  test("Should deposit funds to node with a defined amount of sats", async () => {
    let regtestNode = await getRegtestNode();

    const initialOwnedBalance = mapCurrencyAmount(
      regtestNode?.balances?.ownedBalance,
    );
    const initialSendBalance = mapCurrencyAmount(
      regtestNode?.balances?.availableToSendBalance,
    );
    log("initialOwnedBalance.sats", initialOwnedBalance.sats);
    log("initialSendBalance.sats", initialSendBalance.sats);

    const nodeId = getRegtestNodeId();

    const targetBalanceSats = 40_000_000;
    /* Backend will error on fund_node if total balance is greater than 100,000,000 sats, so we should
       adjust to a target balance less than that: */
    if (initialOwnedBalance.sats > targetBalanceSats) {
      const invoiceAmount = initialOwnedBalance.sats - targetBalanceSats;
      log("adjusting balance: invoiceAmount sats", invoiceAmount);

      await lightsparkClient.loadNodeSigningKey(getRegtestNodeId(), {
        password: REGTEST_SIGNING_KEY_PASSWORD,
      });

      const invoice = await lightsparkClient.createTestModeInvoice(
        nodeId,
        round((initialOwnedBalance.sats - targetBalanceSats) * 1000), // convert to msats
      );

      if (!invoice) {
        throw new Error("Unable to create invoice for balance adjustment");
      }

      const feeRate = 0.0016;
      const payment = await lightsparkClient.payInvoice(
        nodeId,
        invoice,
        round(invoiceAmount * feeRate),
      );

      if (!payment) {
        throw new Error("Payment undefined for balance adjustment");
      }

      const completePayment = await lightsparkClient.waitForTransactionComplete(
        payment.id,
        pollTimeoutSecs,
      );
      log("adjusting balance: completePayment", completePayment);

      if (completePayment.status !== TransactionStatus.SUCCESS) {
        log("adjusting balance: completePayment failed", completePayment);
        throw new Error("Balance adjustment payment failed");
      }
    }

    log(`Funding node ${nodeId} with ${satsToFund} sats`);
    await lightsparkClient.fundNode(nodeId, satsToFund);

    regtestNode = await pollUntil(
      () => {
        return getRegtestNode();
      },
      (current, response) => {
        if (
          current &&
          !mapCurrencyAmount(
            current.balances?.availableToSendBalance,
          ).isEqualTo(initialSendBalance)
        ) {
          return {
            stopPolling: true,
            value: current,
          };
        }
        return response;
      },
      pollIntervalMs,
      pollMaxTimeouts,
      pollIgnoreErrors,
      () => new Error("Timeout waiting for payment to be received"),
    );

    const balances = regtestNode?.balances;
    if (!balances) {
      throw new Error("No balances property on node");
    }
    log(
      "regtestNode.balances.availableToSend sats",
      mapCurrencyAmount(balances.availableToSendBalance).sats,
    );
    log(
      "regtestNode.balances.ownedBalance sats",
      mapCurrencyAmount(balances.ownedBalance).sats,
    );
    log(
      "regtestNode.balances.withdrawableBalance sats",
      mapCurrencyAmount(balances.availableToWithdrawBalance).sats,
    );

    expect(
      mapCurrencyAmount(regtestNode.balances?.availableToSendBalance).isEqualTo(
        initialOwnedBalance,
      ),
    ).toBe(false);
  }, 120_000);

  test("Should pay an invoice", async () => {
    const node = await getRegtestNode();
    log(
      "node.balances.availableToSendBalance",
      node.balances?.availableToSendBalance,
    );

    const testInvoice = await lightsparkClient.createTestModeInvoice(
      getRegtestNodeId(),
      PAY_AMOUNT,
      "hi there!",
    );

    if (!testInvoice) {
      throw new TypeError("Test invoice doesn't created");
    }

    invoicePayment = await lightsparkClient.payInvoice(
      getRegtestNodeId(),
      testInvoice,
      MAX_FEE,
      TESTS_TIMEOUT,
    );
    expect(invoicePayment).toBeDefined();
  });

  // TODO: THIS ACTION CAN BE CREATED ONLY IN MAINNET
  // test('Should deposit funds to node with a defined amount of sats', async () => {
  //     const fundingResult = await lightsparkClient.requestWithdrawal(getRegtestNodeId(), PAY_AMOUNT, '', WithdrawalMode.WALLET_THEN_CHANNELS)
  //     const transaction = await lightsparkClient.waitForTransactionComplete(fundingResult.id, TRANSACTION_WAIT_TIME)
  //     expect(transaction.status).toBe(TransactionStatus.SUCCESS)
  // }, TRANSACTION_WAIT_TIME)

  test(
    "Should open just-in-time channel from inbound payment",
    async () => {
      const payment = await createTestModePayment();
      const { status } = await lightsparkClient.waitForTransactionComplete(
        payment.id,
        TRANSACTION_WAIT_TIME,
      );
      expect(status).toBe(TransactionStatus.SUCCESS);
    },
    TESTS_TIMEOUT,
  );
});

describe(p1SuiteName, () => {
  test(
    "should fetch the current account",
    async () => {
      const wallet = await lightsparkClient.getCurrentAccount();
      expect(wallet?.id).toBeDefined();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should fetch the current account from unauthorized client",
    async () => {
      await expect(
        unauthorizedLightsparkClient.getCurrentAccount(),
      ).rejects.toThrowError();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should listen current payment requests",
    async () => {
      for (let i = 0; i < PAGINATION_STEP; i++) {
        await createTestModePayment();
      }
      const requests = await lightsparkClient.getRecentPaymentRequests(
        getRegtestNodeId(),
        PAGINATION_STEP,
        BitcoinNetwork.REGTEST,
      );
      expect(requests.length).toBe(PAGINATION_STEP);
    },
    LONG_TEST_TIMEOUT,
  );

  test(
    "should listen current payment requests after some date",
    async () => {
      const requestsAfterDate = dayjs(Date.now() - DAY_IN_MS).format();
      const requests = await lightsparkClient.getRecentPaymentRequests(
        getRegtestNodeId(),
        PAGINATION_STEP,
        BitcoinNetwork.REGTEST,
        requestsAfterDate,
      );
      expect(requests.length).toBe(PAGINATION_STEP);
    },
    TESTS_TIMEOUT,
  );

  test(
    "should listen current payment requests from unauthorized client",
    async () => {
      await expect(
        unauthorizedLightsparkClient.getRecentPaymentRequests(
          getRegtestNodeId(),
          PAGINATION_STEP,
          BitcoinNetwork.REGTEST,
        ),
      ).rejects.toThrowError();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should list recent transactions",
    async () => {
      const transactions = await lightsparkClient.getRecentTransactions(
        getRegtestNodeId(),
        undefined,
        BitcoinNetwork.REGTEST,
      );
      expect(transactions.length > 0).toBe(true);
    },
    TESTS_TIMEOUT,
  );

  test("should fetch an invoices payment by IDs", () => {
    if (!invoicePayment?.id) throw new TypeError("invoicePayment is null");

    const payment = OutgoingPayment.getOutgoingPaymentQuery(invoicePayment?.id);

    expect(payment.queryPayload).not.toBeNull();
  });

  test(
    "should decode an invoice",
    async () => {
      const decodedInvoice = await lightsparkClient.decodeInvoice(
        ENCODED_REGTEST_REQUEST_FOR_TESTS,
      );

      expect(decodedInvoice).not.toBeNull();
      expect(decodedInvoice?.memo).toBe("hi there!");
      expect(decodedInvoice?.paymentHash).toBe(
        "7806a0f8acd5385f9dd13d0aaa14922a7349afc5ba5d4b2bbbaaab5abd7f93ca",
      );
    },
    TESTS_TIMEOUT,
  );

  test(
    "should create STANDARD a test mode invoice",
    async () => {
      testModeInvoices.withMemo = await lightsparkClient.createTestModeInvoice(
        getRegtestNodeId(),
        PAY_AMOUNT,
        "hi there!",
      );
      expect(testModeInvoices.withMemo).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should create an AMP a test mode invoice",
    async () => {
      const testInvoice = await lightsparkClient.createTestModeInvoice(
        getRegtestNodeId(),
        0,
        "",
        InvoiceType.AMP,
      );
      expect(testInvoice).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should create a clear memo test mode invoice",
    async () => {
      testModeInvoices.withoutMemo =
        await lightsparkClient.createTestModeInvoice(getRegtestNodeId(), 0);
      expect(testModeInvoices.withoutMemo).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should pay a test mode invoice",
    async () => {
      if (!testModeInvoices.withoutMemo) {
        throw new TypeError("Test mode invoice wasn't created");
      }

      const invoicePayment = await lightsparkClient.payInvoice(
        getRegtestNodeId(),
        testModeInvoices.withoutMemo,
        MAX_FEE,
        TESTS_TIMEOUT,
        PAY_AMOUNT,
      );
      expect(invoicePayment).toBeDefined();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should create a test mode payment",
    async () => {
      const regtestNodeId = getRegtestNodeId();

      const invoiceForTestPayment = await lightsparkClient.createInvoice(
        regtestNodeId,
        PAY_AMOUNT,
        "hi there!",
      );

      if (!invoiceForTestPayment) {
        throw new TypeError("Invoice for test payment wasn't created");
      }

      const payment = await lightsparkClient.createTestModePayment(
        regtestNodeId,
        invoiceForTestPayment,
      );

      if (!payment) {
        throw new TypeError("Test mode payment wasn't created");
      }

      const transaction = await lightsparkClient.waitForTransactionComplete(
        payment.id,
        TRANSACTION_WAIT_TIME,
      );

      expect(transaction?.status).toBe(TransactionStatus.SUCCESS);
    },
    TESTS_TIMEOUT,
  );

  test(
    "should successfully create an uma invoice",
    async () => {
      const nodeId = getRegtestNodeId();

      const metadata = JSON.stringify([
        ["text/plain", "Pay to vasp2.com user $bob"],
        ["text/identifier", "$bob@vasp2.com"],
      ]);

      const umaInvoice = await lightsparkClient.createUmaInvoice(
        nodeId,
        1000,
        metadata,
      );
      expect(umaInvoice?.status).toEqual(PaymentRequestStatus.OPEN);
    },
    TESTS_TIMEOUT,
  );
});

describe(p2SuiteName, () => {
  test(
    "should get a bitcoin fee estimate",
    async () => {
      const fee = await lightsparkClient.getBitcoinFeeEstimate();
      expect(fee).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  // FIXME: THIS ACTION WORKS ONLY IN MAINNET
  // test('should send a keysend payment', async () => {
  //     const payment = await lightsparkClient.sendPayment(
  //         getRegtestNodeId(),
  //         '018afbd7e2fd4f890000ac5e051e3488',
  //         TESTS_TIMEOUT,
  //         PAY_AMOUNT,
  //         MAX_FEE
  //     )
  //     expect(payment?.status).not.toBe(TransactionStatus.FAILED)
  // })

  test(
    "should execute a raw graphql query",
    async () => {
      type DecodeInvoiceQueryResult = {
        decoded_payment_request: {
          __typename: "InvoiceData";
          invoice_data_payment_hash: string;
          invoice_data_amount: {
            currency_amount_original_value: number;
          };
          invoice_data_memo: string;
        };
      };

      const result = await lightsparkClient.executeRawQuery<
        DecodeInvoiceQueryResult["decoded_payment_request"]
      >({
        queryPayload: DecodeInvoice,
        variables: {
          encoded_payment_request: ENCODED_REGTEST_REQUEST_FOR_TESTS,
        },
        constructObject: (data) =>
          (data as DecodeInvoiceQueryResult)?.decoded_payment_request,
      });

      expect({
        invoice_data_payment_hash: result?.invoice_data_payment_hash,
        invoice_data_amount: {
          currency_amount_original_value:
            result?.invoice_data_amount.currency_amount_original_value,
        },
        invoice_data_memo: result?.invoice_data_memo,
      }).toEqual({
        invoice_data_payment_hash:
          "7806a0f8acd5385f9dd13d0aaa14922a7349afc5ba5d4b2bbbaaab5abd7f93ca",
        invoice_data_amount: {
          currency_amount_original_value: 0,
        },
        invoice_data_memo: "hi there!",
      });
    },
    TESTS_TIMEOUT,
  );
});

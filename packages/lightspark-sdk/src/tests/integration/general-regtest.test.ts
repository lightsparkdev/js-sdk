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
  DECODED_REQUEST_DETAILS_FOR_TESTS,
  DEPOSIT_PAY_AMOUNT,
  ENCODED_REGTEST_REQUEST_FOR_TESTS,
  INVOICE_EXPIRY,
  LONG_TEST_TIMEOUT,
  MAX_FEE,
  MAX_WALLET_BALANCE,
  PAGINATION_STEP,
  PAY_AMOUNT,
  REDUCING_BALANCE_FEE,
  REGTEST_SIGNING_KEY_PASSWORD,
  TESTS_TIMEOUT,
  TRANSACTION_WAIT_TIME,
  WALLET_REDUCING_BALANCE_AMOUNT,
} from "./const/index.js";

const unauthorizedLightsparkClient = new LightsparkClient();

const { apiTokenClientId, apiTokenClientSecret, baseUrl } =
  getCredentialsFromEnvOrThrow();

let lightsparkClient: LightsparkClient;
let paymentInvoice: string | undefined;
let regtestNodeId: string | undefined;
let invoicePayment: OutgoingPayment | undefined;

const pollIntervalMs = 250;
const pollTimeoutSecs = 20;
const pollMaxTimeouts = (pollTimeoutSecs * 1000) / pollIntervalMs;
const pollIgnoreErrors = false;

let nodesConnection: AccountToNodesConnection | undefined;

const testModeInvoices: Record<string, string | null> = {
  withMemo: null,
  withoutMemo: null,
};

const reduceBalanceIfItsNeeded = async () => {
  const regtestNode = nodesConnection?.entities[0];
  const initialTotalBalance = mapCurrencyAmount(regtestNode?.totalBalance);
  const nodeId = getRegtestNodeId();

  if (initialTotalBalance.sats >= MAX_WALLET_BALANCE) {
    const invoiceAmount =
      initialTotalBalance.sats - WALLET_REDUCING_BALANCE_AMOUNT;

    await lightsparkClient.loadNodeSigningKey(getRegtestNodeId(), {
      password: REGTEST_SIGNING_KEY_PASSWORD,
    });

    const invoice = await lightsparkClient.createTestModeInvoice(
      nodeId,
      invoiceAmount * 1000,
    );

    if (!invoice) {
      throw new Error("Unable to create invoice for balance adjustment");
    }

    const payment = await lightsparkClient.payInvoice(
      nodeId,
      invoice,
      round(invoiceAmount * REDUCING_BALANCE_FEE),
    );

    if (!payment) {
      throw new Error("Payment undefined for balance adjustment");
    }

    await lightsparkClient.waitForTransactionComplete(
      payment.id,
      TRANSACTION_WAIT_TIME,
    );
  }
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

const getRegtestNodeId = () => {
  expect(regtestNodeId).toBeDefined();
  if (!regtestNodeId) {
    throw new TypeError("No regtest nodes in account");
  }
  return regtestNodeId;
};

describe(initSuiteName, () => {
  test("should get env vars and construct the client successfully", async () => {
    const accountAuthProvider = new AccountTokenAuthProvider(
      apiTokenClientId,
      apiTokenClientSecret,
    );
    lightsparkClient = new LightsparkClient(accountAuthProvider, baseUrl);
    expect(lightsparkClient).toBeDefined();
  });

  test(
    "should successfully get the current account regtest node",
    async () => {
      const account = await lightsparkClient.getCurrentAccount();
      nodesConnection = await account?.getNodes(lightsparkClient, 1, [
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

      await reduceBalanceIfItsNeeded();
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

  test("Should create an any payment amount invoice", async () => {
    const AnyPaymentAmountInvoice = await lightsparkClient.createInvoice(
      getRegtestNodeId(),
      PAY_AMOUNT,
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

  test("Should pay an invoice", async () => {
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

  test("Should deposit funds to node with a defined amount of sats", async () => {
    const fundingResult = await lightsparkClient.fundNode(
      getRegtestNodeId(),
      DEPOSIT_PAY_AMOUNT,
    );
    expect(fundingResult.originalValue).toBe(DEPOSIT_PAY_AMOUNT);
  });

  const satsToFund = 40_000;
  test("Should deposit funds to node with a defined amount of sats", async () => {
    const account = await lightsparkClient.getCurrentAccount();

    if (!account) {
      throw new Error("No account");
    }

    const nodesConnection = await account?.getNodes(lightsparkClient, 1, [
      BitcoinNetwork.REGTEST,
    ]);
    let regtestNode = nodesConnection?.entities[0];
    const initialTotalBalance = mapCurrencyAmount(regtestNode?.totalBalance);
    log("initialTotalBalance.sats", initialTotalBalance.sats);

    const nodeId = getRegtestNodeId();

    /* Backend will error on fund_node if node balance is greater than 100,000,000 sats, so we should
       adjust to a target balance less than that: */
    const targetBalanceSats = 80_000_000;
    if (initialTotalBalance.sats > targetBalanceSats) {
      const invoiceAmount = initialTotalBalance.sats - targetBalanceSats;
      log("adjusting balance: invoiceAmount sats", invoiceAmount);

      await lightsparkClient.loadNodeSigningKey(getRegtestNodeId(), {
        password: REGTEST_SIGNING_KEY_PASSWORD,
      });

      const invoice = await lightsparkClient.createTestModeInvoice(
        nodeId,
        round((initialTotalBalance.sats - targetBalanceSats) * 1000), // convert to msats
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

    await lightsparkClient.fundNode(nodeId, satsToFund);

    regtestNode = await pollUntil(
      () => {
        return account?.getNodes(lightsparkClient, 1, [BitcoinNetwork.REGTEST]);
      },
      (current, response) => {
        if (
          current &&
          !mapCurrencyAmount(current.entities[0]?.totalBalance).isEqualTo(
            initialTotalBalance,
          )
        ) {
          return {
            stopPolling: true,
            value: current.entities[0],
          };
        }
        return response;
      },
      pollIntervalMs,
      pollMaxTimeouts,
      pollIgnoreErrors,
      () => new Error("Timeout waiting for payment to be received"),
    );

    expect(
      mapCurrencyAmount(regtestNode.totalBalance).isEqualTo(
        initialTotalBalance,
      ),
    ).toBe(false);
  }, 120_000);

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

  test("should fetch an invoices payment by IDs", async () => {
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

  test("should create a test mode payment", async () => {
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
  });

  test(
    "Should successfully create an uma invoice",
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
      const result = await lightsparkClient.executeRawQuery({
        queryPayload: DecodeInvoice,
        variables: {
          encoded_payment_request: ENCODED_REGTEST_REQUEST_FOR_TESTS,
        },
        constructObject: (data) => data?.decoded_payment_request,
      });

      expect({
        invoice_data_payment_hash: result.invoice_data_payment_hash,
        invoice_data_amount: {
          currency_amount_original_value:
            result.invoice_data_amount.currency_amount_original_value,
        },
        invoice_data_memo: result.invoice_data_memo,
      }).toEqual(DECODED_REQUEST_DETAILS_FOR_TESTS);
    },
    TESTS_TIMEOUT,
  );
});

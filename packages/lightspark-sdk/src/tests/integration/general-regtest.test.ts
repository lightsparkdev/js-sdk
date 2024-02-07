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
  WithdrawalMode,
  WithdrawalRequestStatus,
  type AccountToNodesConnection,
} from "../../index.js";
import { logger } from "../../logger.js";
import WithdrawalRequest from "../../objects/WithdrawalRequest.js";
import {
  DAY_IN_MS,
  ENCODED_REGTEST_REQUEST_FOR_TESTS,
  INVOICE_EXPIRY,
  LONG_TEST_TIMEOUT,
  PAGINATION_STEP,
  REGTEST_SIGNING_KEY_PASSWORD,
  TESTS_TIMEOUT,
  TRANSACTION_WAIT_TIME,
} from "./constants.js";

const TEST_MODE_L1_WITHDRAWAL_ADDRESS =
  "bcrt1qnuyejmm2l4kavspq0jqaw0fv07lg6zv3z9z3te";

const unauthorizedLightsparkClient = new LightsparkClient();

const { apiTokenClientId, apiTokenClientSecret, baseUrl } =
  getCredentialsFromEnvOrThrow();

const accountAuthProvider = new AccountTokenAuthProvider(
  apiTokenClientId,
  apiTokenClientSecret,
);

const lightsparkClient = new LightsparkClient(accountAuthProvider, baseUrl);

let paymentInvoice: string | undefined;
let regtestNodeId: string | undefined;
let invoicePayment: OutgoingPayment | undefined;

const pollIgnoreErrors = false;

let nodesConnection: AccountToNodesConnection | undefined;

const testModeInvoices: Record<string, string | null> = {
  withMemo: null,
  withoutMemo: null,
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

const createTestModePayment = async (invoiceMemo = "hi there!") => {
  const regtestNodeId = getRegtestNodeId();
  const testInvoice = await lightsparkClient.createInvoice(
    regtestNodeId,
    10_000,
    invoiceMemo,
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

async function fundNode(satsToFund: number) {
  let regtestNode = await getRegtestNode();

  const initialSendBalance = mapCurrencyAmount(
    regtestNode?.balances?.availableToSendBalance,
  );
  log("initialSendBalance.sats", initialSendBalance.sats);

  const nodeId = getRegtestNodeId();

  log(`Funding node ${nodeId} with ${satsToFund} sats`);
  await lightsparkClient.fundNode(nodeId, satsToFund);

  regtestNode = await pollUntil(
    () => {
      return getRegtestNode();
    },
    (current, response) => {
      if (
        current &&
        !mapCurrencyAmount(current.balances?.availableToSendBalance).isEqualTo(
          initialSendBalance,
        )
      ) {
        return {
          stopPolling: true,
          value: current,
        };
      }
      return response;
    },
    (10 * 60 * 1000) / 3000 /* can take several minutes */,
    3000,
    pollIgnoreErrors,
    () => new Error("Timeout waiting for node to be funded"),
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
      initialSendBalance,
    ),
  ).toBe(false);

  return regtestNode;
}

describe(initSuiteName, () => {
  test("Should get env vars and construct the client successfully", () => {
    expect(lightsparkClient).toBeDefined();
  });

  test(
    "Should successfully get the current account regtest node and use it for the current test suite",
    async () => {
      const account = await getAccount();
      nodesConnection = await account.getNodes(lightsparkClient, 1, [
        BitcoinNetwork.REGTEST,
      ]);

      if (!nodesConnection?.entities) {
        throw new TypeError("No connections in account");
      }

      const [regtestNode] = nodesConnection.entities;
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
  test("Should create a standard payment invoice", async () => {
    paymentInvoice = await lightsparkClient.createInvoice(
      getRegtestNodeId(),
      10_000,
      "Standard payment invoice memo",
    );
    expect(paymentInvoice).toBeDefined();
  }, 10_000);

  test("Should create a AMP type invoice", async () => {
    const AmpPaymentInvoice = await lightsparkClient.createInvoice(
      getRegtestNodeId(),
      10_000,
      "AMP payment invoice memo",
      InvoiceType.AMP,
    );
    expect(AmpPaymentInvoice).toBeDefined();
  });

  test("Should create a invoice with custom expiration", async () => {
    const AmpPaymentInvoiceWithExpiration =
      await lightsparkClient.createInvoice(
        getRegtestNodeId(),
        10_000,
        "Invoice with custom expiration memo",
        InvoiceType.STANDARD,
        INVOICE_EXPIRY,
      );
    expect(AmpPaymentInvoiceWithExpiration).toBeDefined();
  });

  test("Should create an invoice that allows the payer to specify any amount", async () => {
    const AnyPaymentAmountInvoice = await lightsparkClient.createInvoice(
      getRegtestNodeId(),
      0,
      "Any amount invoice memo",
      InvoiceType.STANDARD,
      INVOICE_EXPIRY,
    );
    expect(AnyPaymentAmountInvoice).toBeDefined();
  });

  test("Should throw an error on create an unauthorized invoice", async () => {
    await expect(
      unauthorizedLightsparkClient.createInvoice(
        getRegtestNodeId(),
        0,
        "Unauthorized invoice memo",
      ),
    ).rejects.toThrowError();
  });

  test(
    "Should withdraw all funds from the node, also causing all channels to be closed",
    async () => {
      // first make sure we have a balance to withdraw
      let regtestNode = await getRegtestNode();

      const initialSendBalance = mapCurrencyAmount(
        regtestNode?.balances?.availableToSendBalance,
      );
      log("initialSendBalance.sats", initialSendBalance.sats);

      if (initialSendBalance.sats < 100_000) {
        regtestNode = await fundNode(100_000);
      }

      const withdrawalRequest = await lightsparkClient.requestWithdrawal(
        getRegtestNodeId(),
        -1,
        TEST_MODE_L1_WITHDRAWAL_ADDRESS,
        WithdrawalMode.WALLET_THEN_CHANNELS,
      );
      expect(withdrawalRequest).toBeDefined();
      const completedWithdrawalRequest: WithdrawalRequest = await pollUntil(
        () =>
          lightsparkClient.executeRawQuery(
            WithdrawalRequest.getWithdrawalRequestQuery(withdrawalRequest.id),
          ),
        (current, response) => {
          if (
            current &&
            ![
              WithdrawalRequestStatus.IN_PROGRESS,
              WithdrawalRequestStatus.CREATED,
            ].includes(current.status)
          ) {
            return {
              stopPolling: true,
              value: current,
            };
          }
          return response;
        },
        (10 * 60 * 1000) / 3000 /* can take several minutes */,
        3000,
        pollIgnoreErrors,
        () => new Error("Timeout waiting for payment to be received"),
      );
      expect(completedWithdrawalRequest.status).toBe(
        WithdrawalRequestStatus.SUCCESSFUL,
      );
    },
    10 * 60 * 1000 /* can take several minutes */,
  );

  const satsToFund = 10_000_000;
  test(
    "Should deposit funds to node with a defined amount of sats",
    async () => {
      await fundNode(10_000_000);
    },
    10 * 60 * 1000 /* can take several minutes */,
  );

  test("Should pay an invoice", async () => {
    const node = await getRegtestNode();
    log(
      "node.balances.availableToSendBalance",
      node.balances?.availableToSendBalance,
    );

    const testInvoice = await lightsparkClient.createTestModeInvoice(
      getRegtestNodeId(),
      round(satsToFund / 4), // should be some small fraction of the sats we know we have from earlier funding test
      "Attempt to pay test invoice memo",
    );

    if (!testInvoice) {
      throw new TypeError("Test invoice doesn't created");
    }

    invoicePayment = await lightsparkClient.payInvoice(
      getRegtestNodeId(),
      testInvoice,
      10_000_000,
      TESTS_TIMEOUT,
    );
    expect(invoicePayment).toBeDefined();
  });

  test(
    "Should open just-in-time channel from inbound payment",
    async () => {
      const payment = await createTestModePayment(
        "Just-in-time channel payment memo",
      );
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
    "Should fetch the current account",
    async () => {
      const wallet = await lightsparkClient.getCurrentAccount();
      expect(wallet?.id).toBeDefined();
    },
    TESTS_TIMEOUT,
  );

  test(
    "Should fetch the current account from unauthorized client",
    async () => {
      await expect(
        unauthorizedLightsparkClient.getCurrentAccount(),
      ).rejects.toThrowError();
    },
    TESTS_TIMEOUT,
  );

  test(
    "Should list current payment requests",
    async () => {
      for (let i = 0; i < PAGINATION_STEP; i++) {
        await createTestModePayment(`Recent payment request ${i} memo`);
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
    "Should listen current payment requests after some date",
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
    "Should listen current payment requests from unauthorized client",
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
    "Should list recent transactions",
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

  test("Should fetch an invoices payment by IDs", () => {
    if (!invoicePayment?.id) throw new TypeError("invoicePayment is null");

    const payment = OutgoingPayment.getOutgoingPaymentQuery(invoicePayment?.id);

    expect(payment.queryPayload).not.toBeNull();
  });

  test(
    "Should decode an invoice",
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

  test("Should create and cancel uma invoice", async () => {
    const umaInvoice = await lightsparkClient.createUmaInvoice(
      getRegtestNodeId(),
      10_000,
      "UMA invoice memo",
    );
    expect(umaInvoice).toBeDefined();
    const cancelledInvoice = await lightsparkClient.cancelInvoice(
      umaInvoice!.id,
    );
    expect(cancelledInvoice).toBeDefined();
    expect(cancelledInvoice?.id).toBe(umaInvoice?.id);
  });

  test(
    "Should create standard a test mode invoice",
    async () => {
      testModeInvoices.withMemo = await lightsparkClient.createTestModeInvoice(
        getRegtestNodeId(),
        10_000,
        "Standard test mode invoice memo",
      );
      expect(testModeInvoices.withMemo).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test(
    "Should create an AMP a test mode invoice",
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
    "Should create a clear memo test mode invoice",
    async () => {
      testModeInvoices.withoutMemo =
        await lightsparkClient.createTestModeInvoice(getRegtestNodeId(), 0);
      expect(testModeInvoices.withoutMemo).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test(
    "Should create a test mode payment",
    async () => {
      const regtestNodeId = getRegtestNodeId();

      const invoiceForTestPayment = await lightsparkClient.createInvoice(
        regtestNodeId,
        10_000,
        "Create test mode payment invoice memo",
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
    "Should get a bitcoin fee estimate",
    async () => {
      const fee = await lightsparkClient.getBitcoinFeeEstimate(
        BitcoinNetwork.REGTEST,
      );
      expect(fee).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test("Should get a withdrawal fee estimate", async () => {
    const fee = await lightsparkClient.getWithrawalFeeEstimate(
      getRegtestNodeId(),
      100,
      WithdrawalMode.WALLET_THEN_CHANNELS,
    );
    expect(fee).not.toBeNull();
  });

  test(
    "Should execute a raw graphql query",
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

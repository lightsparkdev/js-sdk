/**
 * To run test properly:
 * 1. lightspark-wallet init-env
 * 2. setup LIGHTSPARK_JWT_PUB_KEY into app.lightspark.com account settings
 * 3. yarn workspace @lightsparkdev/wallet-sdk test
 */

import { describe, expect, jest, test } from "@jest/globals";
import {
  DefaultCrypto,
  KeyOrAlias,
  LightsparkException,
  b64encode,
  sleep,
} from "@lightsparkdev/core";

import LightsparkClient from "../client.js";

import { logger } from "../logger.js";
import {
  KeyType,
  TransactionStatus,
  WalletStatus,
  WithdrawalMode,
  getOutgoingPaymentQuery,
  type InvoiceType,
  type OutgoingPayment,
} from "../objects/index.js";
import { TESTS_TIMEOUT } from "./constants.js";
import { deployWallet, getCredentialsFromEnvOrThrow } from "./helpers/index.js";
import { type CreatedInvoiceData } from "./types.js";

const ENCODED_REQUEST_FOR_TESTS =
  "lnbcrt500n1pjdyx6tpp57xttmwwfvp3amu8xcr2lc8rs7zm26utku9qqh7llxwr6cf5yn4ssdqjd4kk6mtdypcxj7n6vycqzpgxqyz5vqsp5mdp46gsf4r3e6dmy7gt5ezakmjqac0mrwzunn7wqnekaj2wr9jls9qyyssq2cx3pzm3484x388crrp64m92wt6yyqtuues2aq9fve0ynx3ln5x4846agck90fnp5ws2mp8jy4qtm9xvszhcvzl7hzw5kd99s44kklgpq0egse";

const credentials = getCredentialsFromEnvOrThrow();

const regtestClient = new LightsparkClient(undefined, credentials.baseUrl);
const unauthorizedRegtestClient = new LightsparkClient(
  undefined,
  credentials.baseUrl,
);
const authorizedRegtestClientWithLockedWallet = new LightsparkClient(
  undefined,
  credentials.baseUrl,
);
let bitcoinAddress: string | null = "";

const generalSuiteName = "general";
const p1SuiteName = "P1";
const p2SuiteName = "P2";

function log(msg: string, ...args: unknown[]) {
  logger.info(
    `${expect
      .getState()
      .currentTestName?.replace(
        new RegExp(
          `^(${generalSuiteName}|${p1SuiteName}|${p2SuiteName})\\s`,
          "g",
        ),
        "",
      )}: ${msg}`,
    ...args,
  );
}

/**
 * For every test `TEST_USER_ID` should be unique
 */
export const TEST_USER_ID = `test_user_${new Date().getTime()}`;
export const CREATE_INVOICE_AMOUNT_MSATS = 100_000 * 1000;
export const CREATE_TEST_INVOICE_AMOUNT_MSATS = 1000 * 1000;

let clientDeployWalletResponse:
  | Awaited<ReturnType<typeof deployWallet>>
  | undefined = undefined;

const invoiceData = {} as CreatedInvoiceData;
const testInvoiceData = {} as Record<InvoiceType, string | null>;

const invoicePayment = {} as Record<InvoiceType, OutgoingPayment | null>;

describe(generalSuiteName, () => {
  jest
    .spyOn(authorizedRegtestClientWithLockedWallet, "isAuthorized")
    .mockResolvedValue(true);

  test(
    "should deploy wallet",
    async () => {
      clientDeployWalletResponse = await deployWallet(
        regtestClient,
        {
          userId: TEST_USER_ID,
          test: true,
        },
        credentials,
      );
      log("wallet", {
        userId: clientDeployWalletResponse.userId,
        walletId: clientDeployWalletResponse.walletId,
      });
      expect(clientDeployWalletResponse.userId).not.toBeNull();

      /* See LIG-4271 - There's a slight delay here between when a wallet is deployed and
         when balances update in RF: */
      await sleep(5000);
    },
    TESTS_TIMEOUT,
  );

  test(
    "should throw an error on deploying wallet twice",
    async () => {
      await expect(
        regtestClient.deployWalletAndAwaitDeployed(),
      ).rejects.toThrow(LightsparkException);
    },
    TESTS_TIMEOUT,
  );

  test(
    "should init the wallet",
    async () => {
      expect(clientDeployWalletResponse).not.toBeUndefined();
      const walletStatus = await regtestClient.initializeWalletAndAwaitReady(
        KeyType.RSA_OAEP,
        clientDeployWalletResponse?.pubKey ?? "",
        KeyOrAlias.key(clientDeployWalletResponse?.privKey ?? ""),
      );
      log("walletStatus", walletStatus);
      expect(walletStatus).toBe(WalletStatus.READY);
    },
    TESTS_TIMEOUT,
  );

  test(
    "should throw an error on trying to init wallet from unauthorized account",
    async () => {
      expect(clientDeployWalletResponse).not.toBeUndefined();
      await expect(
        unauthorizedRegtestClient.initializeWalletAndAwaitReady(
          KeyType.RSA_OAEP,
          clientDeployWalletResponse?.pubKey ?? "",
          KeyOrAlias.key(clientDeployWalletResponse?.privKey ?? ""),
        ),
      ).rejects.toThrow("You must be logged in to perform this action.");
    },
    TESTS_TIMEOUT,
  );

  test(
    "should unlock the wallet",
    async () => {
      expect(clientDeployWalletResponse).not.toBeUndefined();
      await regtestClient.loadWalletSigningKey(
        KeyOrAlias.key(clientDeployWalletResponse?.privKey ?? ""),
      );

      expect(regtestClient.isWalletUnlocked()).toBe(true);
    },
    TESTS_TIMEOUT,
  );

  test(
    "should create a bitcoin funding address",
    async () => {
      bitcoinAddress = await regtestClient.createBitcoinFundingAddress();
      log("bitcoinAddress", bitcoinAddress);
      expect(bitcoinAddress).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test("should throw an error on create a deposit bitcoin address with unauthorized user", async () => {
    await expect(
      unauthorizedRegtestClient.createBitcoinFundingAddress(),
    ).rejects.toThrow("You must be logged in to perform this action.");
  });

  test("should throw an error on create a deposit bitcoin address with locked user", async () => {
    await expect(
      authorizedRegtestClientWithLockedWallet.createBitcoinFundingAddress(),
    ).rejects.toThrow(
      "Request CreateBitcoinFundingAddress failed. Unauthorized",
    );
  });
});

describe("REGTEST createInvoice with createTestModePayment", () => {
  test(
    "should deposit test funds to wallet",
    async () => {
      const invoice = await regtestClient.createInvoice(
        CREATE_INVOICE_AMOUNT_MSATS,
      );

      log("invoice.id", invoice?.id);

      if (!invoice) throw new TypeError("invoice is null");

      let payment = await regtestClient.createTestModePayment(
        invoice.data.encodedPaymentRequest,
      );

      if (!payment) {
        throw new TypeError("payment is null");
      }

      log("payment.id", payment.id);

      payment = await regtestClient.awaitPaymentResult(payment, 1000 * 60 * 5);

      expect(payment.status).toBe(TransactionStatus.SUCCESS);
    },
    TESTS_TIMEOUT,
  );

  test("should throw an error on deposit testnet funds to the account from unauthorized client", async () => {
    await expect(
      unauthorizedRegtestClient.createInvoice(CREATE_TEST_INVOICE_AMOUNT_MSATS),
    ).rejects.toThrowError();
  });

  test("should throw an error on deposit testnet funds to account with locked wallet", async () => {
    await expect(
      authorizedRegtestClientWithLockedWallet.createInvoice(
        CREATE_TEST_INVOICE_AMOUNT_MSATS,
      ),
    ).rejects.toThrowError();
  });

  test(
    "should create a STANDARD type invoice",
    async () => {
      const invoice = await regtestClient.createInvoice(
        CREATE_INVOICE_AMOUNT_MSATS,
        "hi there",
      );

      log("invoice.id", invoice?.id);

      if (!invoice) throw new TypeError("invoice is null");

      invoiceData.STANDARD = invoice.data;

      expect(invoiceData.STANDARD).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should create a empty memo invoice",
    async () => {
      const clearMemoInvoice = await regtestClient.createInvoice(
        CREATE_INVOICE_AMOUNT_MSATS,
      );

      log("invoice.id", clearMemoInvoice?.id);

      expect(clearMemoInvoice).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test("should throw an error on create an unauthorized invoice", async () => {
    await expect(
      unauthorizedRegtestClient.createInvoice(CREATE_INVOICE_AMOUNT_MSATS),
    ).rejects.toThrowError();
  });

  test(
    "should pay a STANDARD invoice",
    async () => {
      if (!invoiceData.STANDARD) {
        throw new Error("testnetInvoiceData is null");
      }

      let payment = await regtestClient.createTestModePayment(
        invoiceData.STANDARD.encodedPaymentRequest,
      );

      if (!payment) {
        throw new Error("payment is null");
      }

      log("payment.id", payment.id);

      payment = await regtestClient.awaitPaymentResult(payment, 1000 * 60 * 5);

      expect(payment.status).toBe(TransactionStatus.SUCCESS);
    },
    TESTS_TIMEOUT,
  );
});

describe("REGTEST createTestModeInvoice with payInvoice", () => {
  test(
    "should send a payment back to the routing node",
    async () => {
      const invoice = await regtestClient.createTestModeInvoice(
        CREATE_TEST_INVOICE_AMOUNT_MSATS,
      );

      if (!invoice) throw new TypeError("invoice is null");

      const payment = await regtestClient.payInvoiceAndAwaitResult(
        invoice,
        CREATE_TEST_INVOICE_AMOUNT_MSATS,
      );
      log("payment.id", payment?.id);
      log("payment.status", payment?.status);

      expect(payment?.status).toBe(TransactionStatus.SUCCESS);
    },
    TESTS_TIMEOUT,
  );

  test("should throw an error on deposit testnet funds to the account from unauthorized client", async () => {
    await expect(
      unauthorizedRegtestClient.createTestModeInvoice(
        CREATE_TEST_INVOICE_AMOUNT_MSATS,
      ),
    ).rejects.toThrowError();
  });

  test("should throw an error on deposit testnet funds to account with locked wallet", async () => {
    await expect(
      authorizedRegtestClientWithLockedWallet.createTestModeInvoice(
        CREATE_TEST_INVOICE_AMOUNT_MSATS,
      ),
    ).rejects.toThrowError();
  });

  test(
    "should create a STANDARD type invoice",
    async () => {
      testInvoiceData.STANDARD = await regtestClient.createTestModeInvoice(
        CREATE_TEST_INVOICE_AMOUNT_MSATS,
        "hi there",
      );

      expect(invoiceData.STANDARD).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should create a empty memo invoice",
    async () => {
      const clearMemoInvoice = await regtestClient.createTestModeInvoice(
        CREATE_TEST_INVOICE_AMOUNT_MSATS,
      );

      expect(clearMemoInvoice).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test("should throw an error on create an unauthorized invoice", async () => {
    await expect(
      unauthorizedRegtestClient.createTestModeInvoice(
        CREATE_TEST_INVOICE_AMOUNT_MSATS,
      ),
    ).rejects.toThrow("You must be logged in to perform this action.");
  });

  /**
   * As we're in REGTEST mode, we can pay invoice only by createTestModePayment
   */
  test(
    "should pay a STANDARD invoice",
    async () => {
      if (!testInvoiceData.STANDARD) {
        throw new Error("testInvoiceData.STANDARD is empty");
      }

      invoicePayment.STANDARD = await regtestClient.payInvoiceAndAwaitResult(
        testInvoiceData.STANDARD,
        CREATE_TEST_INVOICE_AMOUNT_MSATS,
      );
      log("payment result", {
        id: invoicePayment.STANDARD?.id,
        status: invoicePayment.STANDARD?.status,
      });

      expect(invoicePayment.STANDARD.status).toBe(TransactionStatus.SUCCESS);
    },
    TESTS_TIMEOUT,
  );
});

describe(p1SuiteName, () => {
  test(
    "should generate a key",
    async () => {
      // TODO: refactor
      const keypair = await DefaultCrypto.generateSigningKeyPair();

      const serializedKeypair = {
        privateKey: b64encode(
          await DefaultCrypto.serializeSigningKey(keypair.privateKey, "pkcs8"),
        ),
        publicKey: b64encode(
          await DefaultCrypto.serializeSigningKey(keypair.publicKey, "spki"),
        ),
      };

      expect(serializedKeypair.privateKey).not.toBeNull();
      expect(serializedKeypair.publicKey).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should fetch the current wallet",
    async () => {
      const wallet = await regtestClient.getCurrentWallet();
      log("wallet", { walletId: wallet?.id, walletStatus: wallet?.status });
      expect(wallet).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test("should throw an error on fetch the current wallet from unauthorized user", async () => {
    await expect(unauthorizedRegtestClient.getCurrentWallet()).rejects.toThrow(
      "You must be logged in to perform this action.",
    );
  });

  test(
    "should list current payment requests",
    async () => {
      const dashboard = await regtestClient.getWalletDashboard();

      expect(dashboard?.paymentRequests).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should list recent transactions",
    async () => {
      const dashboard = await regtestClient.getWalletDashboard();

      expect(dashboard?.recentTransactions).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test("should throw an error on load walled dashboard from unauthorized wallet", async () => {
    await expect(
      unauthorizedRegtestClient.getWalletDashboard(),
    ).rejects.toThrow("You must be logged in to perform this action.");
  });

  test("should fetch an invoices payment by IDs", async () => {
    if (!invoicePayment.STANDARD?.id) throw new Error("invoicePayment is null");

    const standardPayment = await regtestClient.executeRawQuery(
      getOutgoingPaymentQuery(invoicePayment.STANDARD?.id),
    );

    expect(standardPayment).not.toBeNull();
    expect(standardPayment?.id).toBe(invoicePayment.STANDARD?.id);
  });

  test(
    "should decode an invoice",
    async () => {
      const decodedInvoice = await regtestClient.decodeInvoice(
        ENCODED_REQUEST_FOR_TESTS,
      );

      expect(decodedInvoice).not.toBeNull();
      expect(decodedInvoice?.memo).toBe("mmmmm pizza");
      expect(decodedInvoice?.paymentHash).toBe(
        "f196bdb9c96063ddf0e6c0d5fc1c70f0b6ad7176e1400bfbff3387ac26849d61",
      );
    },
    TESTS_TIMEOUT,
  );
});

describe(p2SuiteName, () => {
  test(
    "should execute a raw graphql query",
    async () => {
      const query = `
        query DecodeInvoice($encoded_payment_request: String!) {
          decoded_payment_request(encoded_payment_request: $encoded_payment_request) {
            __typename
            ... on InvoiceData {
              invoice_data_payment_hash: payment_hash
              invoice_data_amount: amount {
                currency_amount_original_value: original_value
              }
              invoice_data_memo: memo
            }
          }
        }
      `;

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

      const result = await regtestClient.executeRawQuery<
        DecodeInvoiceQueryResult["decoded_payment_request"]
      >({
        queryPayload: query,
        variables: {
          encoded_payment_request: ENCODED_REQUEST_FOR_TESTS,
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
          "f196bdb9c96063ddf0e6c0d5fc1c70f0b6ad7176e1400bfbff3387ac26849d61",
        invoice_data_amount: {
          currency_amount_original_value: 50,
        },
        invoice_data_memo: "mmmmm pizza",
      });
    },
    TESTS_TIMEOUT,
  );

  test(
    "should get an estimated gas price",
    async () => {
      const fee = await regtestClient.getBitcoinFeeEstimate();
      log("fee", fee);
      expect(fee).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should get an estimated withdrawal fee",
    async () => {
      const fee = await regtestClient.getWithrawalFeeEstimate(
        50,
        WithdrawalMode.WALLET_THEN_CHANNELS,
      );
      log("fee", fee);
      expect(fee).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should terminate a wallet",
    async () => {
      await regtestClient.terminateWallet();
      const wallet = await regtestClient.getCurrentWallet();
      log("wallet", {
        status: wallet?.status,
        id: wallet?.id,
      });
      expect(wallet?.status).toBe(WalletStatus.TERMINATED);
    },
    TESTS_TIMEOUT,
  );

  test("should throw an error on terminate unauthorized wallet", async () => {
    await expect(unauthorizedRegtestClient.terminateWallet()).rejects.toThrow(
      "You must be logged in to perform this action.",
    );
  });
});

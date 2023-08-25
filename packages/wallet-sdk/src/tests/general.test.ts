/**
 * To run test properly:
 * 1. lightspark-wallet init-env
 * 2. setup LIGHTSPARK_JWT_PUB_KEY into app.lightspark.com account settings
 * 3. yarn workspace @lightsparkdev/wallet-sdk test
 */

import { describe, expect, jest, test } from "@jest/globals";
import {
  b64encode,
  DefaultCrypto,
  KeyOrAlias,
  LightsparkException,
} from "@lightsparkdev/core";

import LightsparkClient from "../client.js";

import {
  getOutgoingPaymentQuery,
  KeyType,
  TransactionStatus,
  WalletStatus,
  type InvoiceType,
  type OutgoingPayment,
} from "../objects/index.js";
import { FRAGMENT } from "../objects/InvoiceData.js";
import { DEFAULT_BASE_URL, TESTS_TIMEOUT } from "./constants.js";
import {
  deployWallet,
  getCredentialsFromEnvOrThrow,
  sleep,
} from "./helpers/index.js";
import { type CreatedInvoiceData } from "./types.js";

const ENCODED_REQUEST_FOR_TESTS =
  "lnbcrt500n1pjdyx6tpp57xttmwwfvp3amu8xcr2lc8rs7zm26utku9qqh7llxwr6cf5yn4ssdqjd4kk6mtdypcxj7n6vycqzpgxqyz5vqsp5mdp46gsf4r3e6dmy7gt5ezakmjqac0mrwzunn7wqnekaj2wr9jls9qyyssq2cx3pzm3484x388crrp64m92wt6yyqtuues2aq9fve0ynx3ln5x4846agck90fnp5ws2mp8jy4qtm9xvszhcvzl7hzw5kd99s44kklgpq0egse";

const DECODED_REQUEST_FOR_TESTS = {
  __typename: "InvoiceData",
  invoice_data_encoded_payment_request:
    "lnbcrt500n1pjdyx6tpp57xttmwwfvp3amu8xcr2lc8rs7zm26utku9qqh7llxwr6cf5yn4ssdqjd4kk6mtdypcxj7n6vycqzpgxqyz5vqsp5mdp46gsf4r3e6dmy7gt5ezakmjqac0mrwzunn7wqnekaj2wr9jls9qyyssq2cx3pzm3484x388crrp64m92wt6yyqtuues2aq9fve0ynx3ln5x4846agck90fnp5ws2mp8jy4qtm9xvszhcvzl7hzw5kd99s44kklgpq0egse",
  invoice_data_bitcoin_network: "REGTEST",
  invoice_data_payment_hash:
    "f196bdb9c96063ddf0e6c0d5fc1c70f0b6ad7176e1400bfbff3387ac26849d61",
  invoice_data_amount: {
    __typename: "CurrencyAmount",
    currency_amount_original_value: 50,
    currency_amount_original_unit: "SATOSHI",
    currency_amount_preferred_currency_unit: "USD",
    currency_amount_preferred_currency_value_rounded: 1,
    currency_amount_preferred_currency_value_approx: 1.3010668748373666,
  },
  invoice_data_created_at: "2023-08-08T10:39:07+00:00",
  invoice_data_expires_at: "2023-08-09T10:39:07+00:00",
  invoice_data_memo: "mmmmm pizza",
  invoice_data_destination: {
    __typename: "GraphNode",
    graph_node_id: "GraphNode:0189d490-ff0f-cf00-0000-e69aaf4c5d35",
    graph_node_created_at: "2023-08-08T09:53:39.599516+00:00",
    graph_node_updated_at: "2023-08-08T09:53:39.599516+00:00",
    graph_node_alias: null,
    graph_node_bitcoin_network: "REGTEST",
    graph_node_color: null,
    graph_node_conductivity: null,
    graph_node_display_name:
      "035f5b97f1235d1695a84fc18cab869a185aff969e572b53679a4f636e6fd9899b",
    graph_node_public_key:
      "035f5b97f1235d1695a84fc18cab869a185aff969e572b53679a4f636e6fd9899b",
  },
};

const regtestClient = new LightsparkClient(undefined, DEFAULT_BASE_URL);
const unauthorizedRegtestClient = new LightsparkClient(
  undefined,
  DEFAULT_BASE_URL,
);
const authorizedRegtestClientWithLockedWallet = new LightsparkClient(
  undefined,
  DEFAULT_BASE_URL,
);
let bitcoinAddress: string | null = "";

/**
 * For every test `TEST_USER_ID` should be unique
 */
export const TEST_USER_ID = `test_user_${new Date().getTime()}`;
export const CREATE_INVOICE_AMOUNT_MSATS = 100_000 * 1000;
export const CREATE_TEST_INVOICE_AMOUNT_MSATS = 1000 * 1000;

const credentials = getCredentialsFromEnvOrThrow();

let clientDeployWalletResponse:
  | Awaited<ReturnType<typeof deployWallet>>
  | undefined = undefined;

const invoiceData = {} as CreatedInvoiceData;
const testInvoiceData = {} as Record<InvoiceType, string | null>;

const invoicePayment = {} as Record<InvoiceType, OutgoingPayment | null>;
const testInvoicePayment = {} as Record<InvoiceType, OutgoingPayment | null>;

describe("Sanity tests", () => {
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

      expect(clientDeployWalletResponse.userId).not.toBeNull();
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
      const walletStatus = await regtestClient.initializeWalletAndAwaitReady(
        KeyType.RSA_OAEP,
        clientDeployWalletResponse?.pubKey ?? "",
        KeyOrAlias.key(clientDeployWalletResponse?.privKey ?? ""),
      );

      expect(walletStatus).toBe(WalletStatus.READY);
    },
    TESTS_TIMEOUT,
  );

  test(
    "should throw an error on trying to init wallet from unauthorized account",
    async () => {
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

describe("Invoices tests for REGTEST (createInvoice with createTestModePayment)", () => {
  test(
    "should deposit test funds to wallet",
    async () => {
      const invoice = await regtestClient.createInvoice(
        CREATE_INVOICE_AMOUNT_MSATS,
      );

      if (!invoice) throw new TypeError("invoice is null");

      const payment = await regtestClient.createTestModePayment(
        invoice.encodedPaymentRequest,
      );

      await sleep(5_000);

      // FIXME: add payment result awaiting and change expecting status to SUCCESS
      expect(payment?.status).toBe(TransactionStatus.PENDING);
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
      invoiceData.STANDARD = await regtestClient.createInvoice(
        CREATE_INVOICE_AMOUNT_MSATS,
        "hi there",
      );

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

      expect(clearMemoInvoice).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test("should throw an error on create an unauthorized invoice", async () => {
    expect(
      unauthorizedRegtestClient.createInvoice(CREATE_INVOICE_AMOUNT_MSATS),
    ).rejects.toThrowError();
  });

  test(
    "should pay a STANDARD invoice",
    async () => {
      if (!invoiceData.STANDARD) {
        throw new Error("testnetInvoiceData is null");
      }

      testInvoicePayment.STANDARD = await regtestClient.createTestModePayment(
        invoiceData.STANDARD.encodedPaymentRequest,
      );

      // FIXME
      await sleep(5_000);

      // FIXME: add payment result awaiting and change expecting status to SUCCESS
      expect(testInvoicePayment.STANDARD?.status).toBe(
        TransactionStatus.PENDING,
      );
    },
    TESTS_TIMEOUT,
  );
});

describe("Invoices tests for REGTEST (createTestModeInvoice with payInvoice)", () => {
  test(
    "should deposit test funds to wallet",
    async () => {
      const invoice = await regtestClient.createTestModeInvoice(
        CREATE_TEST_INVOICE_AMOUNT_MSATS,
      );

      if (!invoice) throw new TypeError("invoice is null");

      const payment = await regtestClient.payInvoiceAndAwaitResult(
        invoice,
        CREATE_TEST_INVOICE_AMOUNT_MSATS,
      );

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

      expect(invoicePayment.STANDARD.status).toBe(TransactionStatus.SUCCESS);
    },
    TESTS_TIMEOUT,
  );
});

describe("P1 tests", () => {
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

describe("P2 tests", () => {
  test(
    "should execute a raw graphql query",
    async () => {
      const query = `
              query DecodeInvoice($encoded_payment_request: String!) {
                decoded_payment_request(encoded_payment_request: $encoded_payment_request) {
                  __typename
                  ... on InvoiceData {
                    ...InvoiceDataFragment
                  }
                }
              }

            ${FRAGMENT}
        `;

      const result = await regtestClient.executeRawQuery({
        queryPayload: query,
        variables: {
          encoded_payment_request: ENCODED_REQUEST_FOR_TESTS,
        },
        constructObject: (data) => data?.decoded_payment_request,
      });

      expect(result).toEqual(DECODED_REQUEST_FOR_TESTS);
    },
    TESTS_TIMEOUT,
  );

  test(
    "should get an estimated gas price",
    async () => {
      const fee = await regtestClient.getBitcoinFeeEstimate();

      expect(fee).not.toBeNull();
    },
    TESTS_TIMEOUT,
  );

  test(
    "should terminate a wallet",
    async () => {
      await regtestClient.terminateWallet();
      const wallet = await regtestClient.getCurrentWallet();

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

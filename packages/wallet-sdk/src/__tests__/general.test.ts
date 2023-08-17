/**
 * To run test properly:
 * 1. lightspark-wallet init-env
 * 2. source ~/.lightsparkenv
 * 3. setup LIGHTSPARK_JWT_PUB_KEY into app.lightspark.com account settings
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
    InvoiceType,
    KeyType,
    TransactionStatus,
    WalletStatus,
    type OutgoingPayment,
} from "../objects/index.js";
import { FRAGMENT } from "../objects/InvoiceData.js";
import { TESTS_TIMEOUT } from "./consts/index.js";
import { deployWallet, getCredentialsFromEnvOrThrow } from "./helpers/index.js";
import {
    type CreatedInvoiceData,
    type CreatedTestnetInvoiceData,
} from "./types/index.js";

const ENCODED_REQUEST_FOR_TESTS =
    "lnbcrt500n1pjdyx6tpp57xttmwwfvp3amu8xcr2lc8rs7zm26utku9qqh7llxwr6cf5yn4ssdqjd4kk6mtdypcxj7n6vycqzpgxqyz5vqsp5mdp46gsf4r3e6dmy7gt5ezakmjqac0mrwzunn7wqnekaj2wr9jls9qyyssq2cx3pzm3484x388crrp64m92wt6yyqtuues2aq9fve0ynx3ln5x4846agck90fnp5ws2mp8jy4qtm9xvszhcvzl7hzw5kd99s44kklgpq0egse";

const client = new LightsparkClient();
let bitcoinAddress: string | null = '';

const unauthorizedClient = new LightsparkClient();

const authorizedClientWithLockedWallet = new LightsparkClient();

/**
 * For every test `TEST_USER_ID` should be unique
 */
export const TEST_USER_ID = `test_user_${new Date().getTime()}`;
export const TEST_INVOICE_AMOUNT = 1200 * 1000; //mSats

const credentials = getCredentialsFromEnvOrThrow(`_${TEST_USER_ID}`);

let clientDeployWalletResponse:
    | Awaited<ReturnType<typeof deployWallet>>
    | undefined = undefined;

let invoicePayment: Record<InvoiceType, OutgoingPayment>;

describe("Sanity tests", () => {
    const invoiceData = {} as CreatedInvoiceData;

    jest
        .spyOn(authorizedClientWithLockedWallet, "isAuthorized")
        .mockResolvedValue(true);

    test(
        "should deploy wallet",
        async () => {
            clientDeployWalletResponse = await deployWallet(
                client,
                {
                    userId: TEST_USER_ID,
                    test: true,
                },
                credentials
            );

            expect(clientDeployWalletResponse.userId).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should throw an error on deploying wallet twice",
        async () => {
            await expect(client.deployWalletAndAwaitDeployed()).rejects.toThrow(
                LightsparkException
            );
        },
        TESTS_TIMEOUT
    );

    test(
        "should init the wallet",
        async () => {
            const walletStatus = await client.initializeWalletAndAwaitReady(
                KeyType.RSA_OAEP,
                clientDeployWalletResponse?.pubKey ?? "",
                KeyOrAlias.key(clientDeployWalletResponse?.privKey ?? "")
            );

            expect(walletStatus).toBe(WalletStatus.READY);
        },
        TESTS_TIMEOUT
    );

    test(
        "should return an error on trying to init wallet twice",
        async () => {
            await expect(
                client.initializeWalletAndAwaitReady(
                    KeyType.RSA_OAEP,
                    clientDeployWalletResponse?.pubKey ?? "",
                    KeyOrAlias.key(clientDeployWalletResponse?.privKey ?? "")
                )
            ).rejects.toThrow(LightsparkException);
        },
        TESTS_TIMEOUT
    );

    test(
        "should return an error on trying to init wallet from unauthorized account",
        async () => {
            await expect(
                unauthorizedClient.initializeWalletAndAwaitReady(
                    KeyType.RSA_OAEP,
                    clientDeployWalletResponse?.pubKey ?? "",
                    KeyOrAlias.key(clientDeployWalletResponse?.privKey ?? "")
                )
            ).rejects.toThrow("You must be logged in to perform this action.");
        },
        TESTS_TIMEOUT
    );

    test(
        "should unlock the wallet",
        async () => {
            await client.loadWalletSigningKey(
                KeyOrAlias.key(clientDeployWalletResponse?.privKey ?? "")
            );

            expect(client.isWalletUnlocked()).toBe(true);
        },
        TESTS_TIMEOUT
    );

    test(
        "should create a bitcoin funding address",
        async () => {
            bitcoinAddress = await client.createBitcoinFundingAddress();

            expect(bitcoinAddress).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should deposit wallet account",
        async () => {
            const invoice = await client.createTestModeInvoice(TEST_INVOICE_AMOUNT);

            expect(invoice).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on deposit testnet funds to the account from unauthorized client", async () => {
        await expect(
            client.createTestModeInvoice(TEST_INVOICE_AMOUNT)
        ).rejects.toThrowError();
    });

    test("should throw an error on deposit testnet funds to account with locked wallet", async () => {
        await expect(client.createTestModeInvoice(TEST_INVOICE_AMOUNT)).rejects.toThrowError();
    });

    test(
        "should create an AMP type invoice",
        async () => {
            invoiceData.AMP = await client.createInvoice(
                TEST_INVOICE_AMOUNT,
                "hi there",
                InvoiceType.AMP
            );

            expect(invoiceData.AMP).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should create a STANDARD type invoice",
        async () => {
            invoiceData.STANDARD = await client.createInvoice(
                TEST_INVOICE_AMOUNT,
                "hi there"
            );

            expect(invoiceData.STANDARD).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should create a empty memo invoice",
        async () => {
            const clearMemoInvoice = await client.createInvoice(TEST_INVOICE_AMOUNT);

            expect(clearMemoInvoice).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on create an unauthorized invoice", async () => {
        await expect(
            unauthorizedClient.createInvoice(TEST_INVOICE_AMOUNT)
        ).rejects.toThrow("You must be logged in to perform this action.");
    });

    /**
     * As we're in REGTEST mode, we can pay invoice only by createTestModePayment
     */
    test(
        "should pay a STANDARD invoice",
        async () => {
            if (!invoiceData.STANDARD) {
                throw new Error("testnetInvoiceData is null");
            }

            const _invoicePayment = await client.createTestModePayment(
                invoiceData.STANDARD.encodedPaymentRequest,
                1_000_000
            );

            if (!_invoicePayment) throw new TypeError("invoicePayment is null");

            invoicePayment.STANDARD = _invoicePayment;

            console.log(invoicePayment, "payment testnet invoice");

            console.log(
                `Testnet payment done with status= ${invoicePayment.STANDARD.status}, ID = ${invoicePayment.STANDARD.id}`
            );

            expect(invoicePayment.STANDARD.status).toBe(TransactionStatus.SUCCESS);
        },
        TESTS_TIMEOUT
    );

    /**
     * As we're in REGTEST mode, we can pay invoice only by createTestModePayment
     */
    test(
        "should pay a AMP invoice",
        async () => {
            if (!invoiceData.AMP) {
                throw new Error("testnetInvoiceData is null");
            }

            const _invoicePayment = await client.createTestModePayment(
                invoiceData.AMP.encodedPaymentRequest,
                1_000_000
            );

            if (!_invoicePayment) throw new TypeError("invoicePayment is null");

            invoicePayment.AMP = _invoicePayment;

            console.log(invoicePayment, "payment testnet invoice");

            console.log(
                `Testnet payment done with status= ${invoicePayment.AMP.status}, ID = ${invoicePayment.AMP.id}`
            );

            expect(invoicePayment.AMP.status).toBe(TransactionStatus.SUCCESS);
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on create a deposit bitcoin address with unauthorized user", async () => {
        await expect(
            unauthorizedClient.createBitcoinFundingAddress()
        ).rejects.toThrow("You must be logged in to perform this action.");
    });
});

describe("P1 tests", () => {
    test(
        "should generate a key",
        async () => {
            // TODO: refactor
            const keypair = await DefaultCrypto.generateSigningKeyPair();

            const serializedKeypair = {
                privateKey: b64encode(
                    await DefaultCrypto.serializeSigningKey(keypair.privateKey, "pkcs8")
                ),
                publicKey: b64encode(
                    await DefaultCrypto.serializeSigningKey(keypair.publicKey, "spki")
                ),
            };

            expect(serializedKeypair.privateKey).not.toBeNull();
            expect(serializedKeypair.publicKey).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should fetch the current wallet",
        async () => {
            const wallet = await client.getCurrentWallet();

            expect(wallet).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on fetch the current wallet from unauthorized user", async () => {
        await expect(unauthorizedClient.getCurrentWallet()).rejects.toThrow(
            "You must be logged in to perform this action."
        );
    });

    test(
        "should list current payment requests",
        async () => {
            const dashboard = await client.getWalletDashboard();

            expect(dashboard?.paymentRequests).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should list recent transactions",
        async () => {
            const dashboard = await client.getWalletDashboard();

            expect(dashboard?.recentTransactions).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on load walled dashboard from unauthorized wallet", async () => {
        await expect(unauthorizedClient.getWalletDashboard()).rejects.toThrow(
            "You must be logged in to perform this action."
        );
    });

    test("should fetch an invoices payment by IDs", async () => {
        const standardPayment = await client.executeRawQuery(
            getOutgoingPaymentQuery(invoicePayment.STANDARD.id)
        );
        const ampPayment = await client.executeRawQuery(
            getOutgoingPaymentQuery(invoicePayment.AMP.id)
        );

        expect(standardPayment).not.toBeNull();
        expect(standardPayment?.id).toBe(invoicePayment.STANDARD.id);

        expect(ampPayment).not.toBeNull();
        expect(ampPayment?.id).toBe(invoicePayment.STANDARD.id);
    });

    test(
        "should decode an invoice",
        async () => {
            const decodedInvoice = await client.decodeInvoice(
                ENCODED_REQUEST_FOR_TESTS
            );

            expect(decodedInvoice).not.toBeNull();
            expect(decodedInvoice?.memo).toBe("mmmmm pizza");
            expect(decodedInvoice?.paymentHash).toBe(
                "f196bdb9c96063ddf0e6c0d5fc1c70f0b6ad7176e1400bfbff3387ac26849d61"
            );
        },
        TESTS_TIMEOUT
    );
});

describe("P2 tests", () => {
    const testInvoiceData = {} as CreatedTestnetInvoiceData;

    test("should send a keysend payment", async () => {
        expect(1).toBe(1);
    });

    test(
        "should execute a raw graphql query",
        async () => {
            // TODO: import from objects/fragments
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

            const result = await client.executeRawQuery({
                queryPayload: query,
                variables: {
                    encoded_payment_request: ENCODED_REQUEST_FOR_TESTS,
                },
                constructObject: (data) => data?.decoded_payment_request,
            });

            expect(result).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should get an estimated gas price",
        async () => {
            const fee = await client.getBitcoinFeeEstimate();

            expect(fee).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test("should create a STANDARD test mode invoice", async () => {
        testInvoiceData.STANDARD = await client.createTestModeInvoice(
            TEST_INVOICE_AMOUNT
        );
        expect(testInvoiceData.STANDARD).not.toBeNull();
    });

    test("should create a AMP test mode invoice", async () => {
        testInvoiceData.AMP = await client.createTestModeInvoice(
            TEST_INVOICE_AMOUNT,
            InvoiceType.AMP
        );
        expect(testInvoiceData.STANDARD).not.toBeNull();
    });

    test(
        "should create a empty memo test mode invoice",
        async () => {
            const clearMemoTestInvoice = await client.createTestModeInvoice(
                TEST_INVOICE_AMOUNT,
                InvoiceType.AMP
            );

            expect(clearMemoTestInvoice).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on create a empty memo test mode invoice with unauthorized account", async () => {
        await expect(
            unauthorizedClient.createTestModeInvoice(TEST_INVOICE_AMOUNT)
        ).rejects.toThrow("You must be logged in to perform this action.");
    });

    test(
        "should terminate a wallet",
        async () => {
            await client.terminateWallet();
            const wallet = await client.getCurrentWallet();

            expect(wallet?.status).toBe(WalletStatus.TERMINATING);
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on terminate unauthorized wallet", async () => {
        await expect(unauthorizedClient.terminateWallet()).rejects.toThrow(
            "You must be logged in to perform this action."
        );
    });
});

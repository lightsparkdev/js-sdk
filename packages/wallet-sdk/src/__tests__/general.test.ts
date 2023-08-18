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
    InvoiceType,
    KeyType,
    TransactionStatus,
    WalletStatus,
    type OutgoingPayment,
} from "../objects/index.js";
import { FRAGMENT } from "../objects/InvoiceData.js";
import { TESTS_TIMEOUT } from "./consts/index.js";
import {deployWallet, getCredentialsFromEnvOrThrow, sleep} from "./helpers/index.js";
import {
    type CreatedInvoiceData,
} from "./types/index.js";

const ENCODED_REQUEST_FOR_TESTS =
    "lnbcrt500n1pjdyx6tpp57xttmwwfvp3amu8xcr2lc8rs7zm26utku9qqh7llxwr6cf5yn4ssdqjd4kk6mtdypcxj7n6vycqzpgxqyz5vqsp5mdp46gsf4r3e6dmy7gt5ezakmjqac0mrwzunn7wqnekaj2wr9jls9qyyssq2cx3pzm3484x388crrp64m92wt6yyqtuues2aq9fve0ynx3ln5x4846agck90fnp5ws2mp8jy4qtm9xvszhcvzl7hzw5kd99s44kklgpq0egse";

const regtestClient = new LightsparkClient();
// const testnetClient = new LightsparkClient();
// const mainnetClient =  new LightsparkClient();
let bitcoinAddress: string | null = '';

const unauthorizedClient = new LightsparkClient();
const authorizedClientWithLockedWallet = new LightsparkClient();

/**
 * For every test `TEST_USER_ID` should be unique
 */
export const TEST_USER_ID = `test_user_${new Date().getTime()}`;
export const CREATE_INVOICE_AMOUNT_MSATS = 100_000 * 1000;
export const CREATE_TEST_INVOICE_AMOUNT_MSATS = 1000 * 1000;

const credentials = getCredentialsFromEnvOrThrow(`_${TEST_USER_ID}`);

let clientDeployWalletResponse:
    | Awaited<ReturnType<typeof deployWallet>>
    | undefined = undefined;

const invoiceData = {} as CreatedInvoiceData;
const testInvoiceData = {} as Record<InvoiceType, string | null>;

const invoicePayment = {} as Record<InvoiceType, OutgoingPayment | null>;
const testInvoicePayment = {} as Record<InvoiceType, OutgoingPayment | null>;

describe("Sanity tests", () => {
    jest
        .spyOn(authorizedClientWithLockedWallet, "isAuthorized")
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
                credentials
            );

            expect(clientDeployWalletResponse.userId).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should throw an error on deploying wallet twice",
        async () => {
            await expect(regtestClient.deployWalletAndAwaitDeployed()).rejects.toThrow(
                LightsparkException
            );
        },
        TESTS_TIMEOUT
    );

    test(
        "should init the wallet",
        async () => {
            const walletStatus = await regtestClient.initializeWalletAndAwaitReady(
                KeyType.RSA_OAEP,
                clientDeployWalletResponse?.pubKey ?? "",
                KeyOrAlias.key(clientDeployWalletResponse?.privKey ?? "")
            );

            expect(walletStatus).toBe(WalletStatus.READY);
        },
        TESTS_TIMEOUT
    );

    test(
        "should throw an error on trying to init wallet twice",
        async () => {
            await expect(
                regtestClient.initializeWalletAndAwaitReady(
                    KeyType.RSA_OAEP,
                    clientDeployWalletResponse?.pubKey ?? "",
                    KeyOrAlias.key(clientDeployWalletResponse?.privKey ?? "")
                )
            ).rejects.toThrow(LightsparkException);
        },
        TESTS_TIMEOUT
    );

    test(
        "should throw an error on trying to init wallet from unauthorized account",
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
            await regtestClient.loadWalletSigningKey(
                KeyOrAlias.key(clientDeployWalletResponse?.privKey ?? "")
            );

            expect(regtestClient.isWalletUnlocked()).toBe(true);
        },
        TESTS_TIMEOUT
    );

    test(
        "should create a bitcoin funding address",
        async () => {
            bitcoinAddress = await regtestClient.createBitcoinFundingAddress();

            expect(bitcoinAddress).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on create a deposit bitcoin address with unauthorized user", async () => {
        await expect(
            unauthorizedClient.createBitcoinFundingAddress()
        ).rejects.toThrow("You must be logged in to perform this action.");
    });

    test("should throw an error on create a deposit bitcoin address with locked user", async () => {
        await expect(
            authorizedClientWithLockedWallet.createBitcoinFundingAddress()
        ).rejects.toThrow("Request CreateBitcoinFundingAddress failed. Unauthorized");
    });
});

describe("Invoices tests for REGTEST (createInvoice with createTestModePayment)", () => {
    test(
        "should deposit wallet account",
        async () => {
            const invoice = await regtestClient.createInvoice(CREATE_INVOICE_AMOUNT_MSATS);

            if (!invoice) throw new TypeError('invoice is null');

            // TODO: add payment result awaiting
            const payment = await regtestClient.createTestModePayment(invoice.encodedPaymentRequest);

            await sleep(5_000)

            expect(payment?.status).toBe(TransactionStatus.SUCCESS);
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on deposit testnet funds to the account from unauthorized client", async () => {
        await expect(
            unauthorizedClient.createInvoice(CREATE_TEST_INVOICE_AMOUNT_MSATS)
        ).rejects.toThrowError();
    });

    test("should throw an error on deposit testnet funds to account with locked wallet", async () => {
        await expect(authorizedClientWithLockedWallet.createInvoice(CREATE_TEST_INVOICE_AMOUNT_MSATS)).rejects.toThrowError();
    });

    test(
        "should create a STANDARD type invoice",
        async () => {
            invoiceData.STANDARD = await regtestClient.createInvoice(
                CREATE_INVOICE_AMOUNT_MSATS,
                "hi there"
            );

            expect(invoiceData.STANDARD).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should create an AMP type invoice",
        async () => {
            invoiceData.AMP = await regtestClient.createInvoice(
                CREATE_INVOICE_AMOUNT_MSATS,
                "hi there",
                InvoiceType.AMP
            );

            expect(invoiceData.AMP).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should create a empty memo invoice",
        async () => {
            const clearMemoInvoice = await regtestClient.createInvoice(CREATE_INVOICE_AMOUNT_MSATS);

            expect(clearMemoInvoice).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on create an unauthorized invoice", async () => {
        expect(unauthorizedClient.createInvoice(CREATE_INVOICE_AMOUNT_MSATS)).rejects.toThrowError();
    });

    test(
        "should pay a STANDARD invoice",
        async () => {
            if (!invoiceData.STANDARD) {
                throw new Error("testnetInvoiceData is null");
            }

            // TODO: add payment result awaiting
            testInvoicePayment.STANDARD = await regtestClient.createTestModePayment(
                invoiceData.STANDARD.encodedPaymentRequest
            );

            console.log(testInvoicePayment.STANDARD);

            // FIXME
            await sleep(5_000)

            expect(testInvoicePayment.STANDARD?.status).toBe(TransactionStatus.SUCCESS);
        },
        TESTS_TIMEOUT
    );

    test(
        "should pay a AMP invoice",
        async () => {
            if (!invoiceData.AMP) {
                throw new Error("testnetInvoiceData is null");
            }

            // TODO: add payment result awaiting
            testInvoicePayment.AMP = await regtestClient.createTestModePayment(
                invoiceData.AMP.encodedPaymentRequest
            );

            console.log(testInvoicePayment.AMP);

            // FIXME
            await sleep(5_000)

            expect(testInvoicePayment.AMP?.status).toBe(TransactionStatus.SUCCESS);
        },
        TESTS_TIMEOUT
    );
});

describe("Invoices tests for REGTEST (createTestModeInvoice with payInvoice)", () => {
    test(
        "should deposit wallet account",
        async () => {
            const invoice = await regtestClient.createTestModeInvoice(CREATE_TEST_INVOICE_AMOUNT_MSATS);

            if (!invoice) throw new TypeError('invoice is null');

            const payment = await regtestClient.payInvoiceAndAwaitResult(invoice, CREATE_TEST_INVOICE_AMOUNT_MSATS);

            expect(payment?.status).toBe(TransactionStatus.SUCCESS);
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on deposit testnet funds to the account from unauthorized client", async () => {
        await expect(
            unauthorizedClient.createTestModeInvoice(CREATE_TEST_INVOICE_AMOUNT_MSATS)
        ).rejects.toThrowError();
    });

    test("should throw an error on deposit testnet funds to account with locked wallet", async () => {
        await expect(authorizedClientWithLockedWallet.createTestModeInvoice(CREATE_TEST_INVOICE_AMOUNT_MSATS)).rejects.toThrowError();
    });

    test(
        "should create a STANDARD type invoice",
        async () => {
            testInvoiceData.STANDARD = await regtestClient.createTestModeInvoice(
                CREATE_TEST_INVOICE_AMOUNT_MSATS,
                "hi there"
            );

            expect(invoiceData.STANDARD).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should create an AMP type invoice",
        async () => {
            testInvoiceData.AMP = await regtestClient.createTestModeInvoice(
                CREATE_TEST_INVOICE_AMOUNT_MSATS,
                "hi there",
                InvoiceType.AMP
            );

            expect(invoiceData.AMP).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should create a empty memo invoice",
        async () => {
            const clearMemoInvoice = await regtestClient.createTestModeInvoice(CREATE_TEST_INVOICE_AMOUNT_MSATS);

            expect(clearMemoInvoice).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on create an unauthorized invoice", async () => {
        await expect(
            unauthorizedClient.createTestModeInvoice(CREATE_TEST_INVOICE_AMOUNT_MSATS)
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
                CREATE_TEST_INVOICE_AMOUNT_MSATS
            );

            console.log(invoicePayment.STANDARD);

            expect(invoicePayment.STANDARD.status).toBe(TransactionStatus.SUCCESS);
        },
        TESTS_TIMEOUT
    );

    test(
        "should pay a AMP invoice",
        async () => {
            if (!testInvoiceData.AMP) {
                throw new Error("testInvoiceData.AMP is empty");
            }

            invoicePayment.AMP = await regtestClient.payInvoiceAndAwaitResult(
                testInvoiceData.AMP,
                CREATE_TEST_INVOICE_AMOUNT_MSATS
            );

            console.log(invoicePayment.AMP, "payment testnet invoice");

            expect(invoicePayment.AMP.status).toBe(TransactionStatus.SUCCESS);
        },
        TESTS_TIMEOUT
    );
});

// describe("Invoices tests for TESTNET", () => {});

// describe("Invoices tests for MAINNET", () => {});

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
            const wallet = await regtestClient.getCurrentWallet();

            console.log('wallet?.id', wallet?.id)

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
            const dashboard = await regtestClient.getWalletDashboard();

            expect(dashboard?.paymentRequests).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should list recent transactions",
        async () => {
            const dashboard = await regtestClient.getWalletDashboard();

            expect(dashboard?.recentTransactions).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on load walled dashboard from unauthorized wallet", async () => {
        await expect(unauthorizedClient.getWalletDashboard()).rejects.toThrow(
            "You must be logged in to perform this action."
        );
    });

    // test("should fetch an invoices by IDs", async () => {
    //     const standardInvoice = await regtestClient.executeRawQuery(
    //         getInvoiceQuery(invoiceData.STANDARD?.)
    //     );
    //
    //     const ampInvoice = await regtestClient.executeRawQuery(
    //         getInvoiceQuery(invoicePayment.AMP.id)
    //     );
    //
    //     expect(standardPayment).not.toBeNull();
    //     expect(standardPayment?.id).toBe(invoicePayment.STANDARD.id);
    //
    //     expect(ampPayment).not.toBeNull();
    //     expect(ampPayment?.id).toBe(invoicePayment.STANDARD.id);
    // });

    test("should fetch an invoices payment by IDs", async () => {
        if (!invoicePayment.STANDARD?.id || !invoicePayment.AMP?.id) throw new Error('invoicePayment is null');

        const standardPayment = await regtestClient.executeRawQuery(
            getOutgoingPaymentQuery(invoicePayment.STANDARD?.id)
        );
        const ampPayment = await regtestClient.executeRawQuery(
            getOutgoingPaymentQuery(invoicePayment.AMP?.id)
        );

        expect(standardPayment).not.toBeNull();
        expect(standardPayment?.id).toBe(invoicePayment.STANDARD?.id);

        expect(ampPayment).not.toBeNull();
        expect(ampPayment?.id).toBe(invoicePayment.AMP?.id);
    });

    test("should fetch an test invoices payment by IDs", async () => {
        if (!testInvoicePayment.STANDARD?.id || !testInvoicePayment.AMP?.id) throw new Error('testInvoicePayment is null');

        const standardPayment = await regtestClient.executeRawQuery(
            getOutgoingPaymentQuery(testInvoicePayment.STANDARD?.id)
        );
        const ampPayment = await regtestClient.executeRawQuery(
            getOutgoingPaymentQuery(testInvoicePayment.AMP?.id)
        );

        expect(standardPayment).not.toBeNull();
        expect(standardPayment?.id).toBe(testInvoicePayment.STANDARD?.id);

        expect(ampPayment).not.toBeNull();
        expect(ampPayment?.id).toBe(testInvoicePayment.STANDARD?.id);
    });

    test(
        "should decode an invoice",
        async () => {
            const decodedInvoice = await regtestClient.decodeInvoice(
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

            const result = await regtestClient.executeRawQuery({
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
            const fee = await regtestClient.getBitcoinFeeEstimate();

            expect(fee).not.toBeNull();
        },
        TESTS_TIMEOUT
    );

    test(
        "should terminate a wallet",
        async () => {
            await regtestClient.terminateWallet();
            const wallet = await regtestClient.getCurrentWallet();

            expect(wallet?.status).toBe(WalletStatus.TERMINATED);
        },
        TESTS_TIMEOUT
    );

    test("should throw an error on terminate unauthorized wallet", async () => {
        await expect(unauthorizedClient.terminateWallet()).rejects.toThrow(
            "You must be logged in to perform this action."
        );
    });
});

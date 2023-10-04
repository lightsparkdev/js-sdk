import {describe, expect, test} from "@jest/globals";
import {b64encode, DefaultCrypto,} from "@lightsparkdev/core";

import LightsparkClient from "../client.js";

import {InvoiceType, TransactionStatus, WithdrawalRequestStatus,} from "../objects/index.js";
import {FRAGMENT} from "../objects/InvoiceData.js";
import WithdrawalMode from "../objects/WithdrawalMode.js";
import { AccountTokenAuthProvider } from '../auth/index.js'

const TESTS_TIMEOUT = 500 //ms

const INVOICE_EXPIRY = 172800 //ms

const PAY_AMOUNT = 1000 //msats

const MAX_FEE = 10000000 //msats

const PAGGING_STEP = 30

const ENCODED_REQUEST_FOR_TESTS =
    "lnbcrt500n1pjdyx6tpp57xttmwwfvp3amu8xcr2lc8rs7zm26utku9qqh7llxwr6cf5yn4ssdqjd4kk6mtdypcxj7n6vycqzpgxqyz5vqsp5mdp46gsf4r3e6dmy7gt5ezakmjqac0mrwzunn7wqnekaj2wr9jls9qyyssq2cx3pzm3484x388crrp64m92wt6yyqtuues2aq9fve0ynx3ln5x4846agck90fnp5ws2mp8jy4qtm9xvszhcvzl7hzw5kd99s44kklgpq0egse";

const DECODED_REQUEST_DETAILS_FOR_TESTS = {
    invoice_data_payment_hash:
        "f196bdb9c96063ddf0e6c0d5fc1c70f0b6ad7176e1400bfbff3387ac26849d61",
    invoice_data_amount: {
        currency_amount_original_value: 50,
    },
    invoice_data_memo: "mmmmm pizza",
};

const TEST_API_TOKEN_ID = '018af9da9a804f89000044fae9826c1b'
const TEST_API_TOKEN = 'ARkLPSlrlHmfecshFyAJGOko3lpdWwFPWsDikWe7R5Y'

const PROD_IP_TOKEN_ID = '018af9db01944f89000048e564c32e97'
const PROD_API_TOKEN = 'REdquq4r30ScPdK2HqI6SzRq-cn0QTE5WOj07AmO4o4'

/** FIXME: CAN I SEE AN EXAMPLE OF `LightsparkClient` CREATION AND INITING? AND MORE INFO ABOUT NODE_ID? */
const regtestClient = new LightsparkClient(new AccountTokenAuthProvider(TEST_API_TOKEN_ID, TEST_API_TOKEN))
const prodClient = new LightsparkClient(new AccountTokenAuthProvider(PROD_IP_TOKEN_ID, PROD_API_TOKEN))
const unauthorizedRegtestClient = new LightsparkClient()

let testInvoice: string | null

let normalPaymentInvoice: string | undefined

describe("P0 tests", () => {
    test('Should create a normal payment invoice', async () => {
        normalPaymentInvoice = await regtestClient.createInvoice('', PAY_AMOUNT, 'hi there!')
        expect(normalPaymentInvoice).toBeDefined()
    })

    test('Should create a AMP type invoice', async () => {
        const AmpPaymentInvoice =
            await regtestClient.createInvoice('', PAY_AMOUNT, 'hi there!', InvoiceType.AMP)
        expect(AmpPaymentInvoice).toBeDefined()
    })

    test('Should create a invoice with custom expiration', async () => {
        const AmpPaymentInvoiceWithExpiration =
            await regtestClient.createInvoice('', PAY_AMOUNT, 'hi there!', InvoiceType.AMP, INVOICE_EXPIRY)
        expect(AmpPaymentInvoiceWithExpiration).toBeDefined()
    })

    test('Should create an any payment amount invoice', async () => {
        const AnyPaymentAmountInvoice =
            await regtestClient.createInvoice('', PAY_AMOUNT, 'hi there!', InvoiceType.AMP, INVOICE_EXPIRY)
        expect(AnyPaymentAmountInvoice).toBeDefined()
    })

    test("should throw an error on create an unauthorized invoice", async () => {
        await expect(
            unauthorizedRegtestClient.createInvoice('', 0, 'hi there!'),
        ).rejects.toThrowError();
    });

    test('Should pay an invoice', async () => {
        const AmpPaymentInvoiceWithExpiration = await regtestClient.payInvoice('', normalPaymentInvoice ?? '', MAX_FEE, )
        expect(AmpPaymentInvoiceWithExpiration).toBeDefined()
    })

    /** TODO: CREATE A PAY INVOICE TEST WITH UNAUTHORIZED WALLET */

    test('Should pay an invoice from unauthorized wallet and throw an error', async () => {
        expect(true).toBe(true)
    })

    /** TODO: CREATE A DEPOSIT TEST. Should it be created using the `createLnurlInvoice` method? */
    test('Should deposit funds to wallet', async () => {
        expect(true).toBe(true)
    })

    test('Should withdraw funds from wallet with WALLET_ONLY withdrawal mode', async () => {
        const walletAddressToWithdraw = await regtestClient.createNodeWalletAddress('')
        const withdrawResult = await regtestClient.requestWithdrawal('', PAY_AMOUNT, walletAddressToWithdraw, WithdrawalMode.WALLET_ONLY)
        expect(withdrawResult.status).not.toBe(WithdrawalRequestStatus.FAILED)
    })

    test('Should withdraw funds from wallet with WALLET_THEN_CHANNELS withdrawal mode', async () => {
        const walletAddressToWithdraw = await regtestClient.createNodeWalletAddress('')
        const withdrawResult = await regtestClient.requestWithdrawal('', PAY_AMOUNT, walletAddressToWithdraw, WithdrawalMode.WALLET_THEN_CHANNELS)
        expect(withdrawResult.status).not.toBe(WithdrawalRequestStatus.FAILED)
    })

    test('Should withdraw funds from wallet with FUTURE_VALUE withdrawal mode', async () => {
        const walletAddressToWithdraw = await regtestClient.createNodeWalletAddress('')
        const withdrawResult = await regtestClient.requestWithdrawal('', PAY_AMOUNT, walletAddressToWithdraw, WithdrawalMode.FUTURE_VALUE)
        expect(withdrawResult.status).not.toBe(WithdrawalRequestStatus.FAILED)
    })

    test('Should withdraw funds from unauthorized wallet and throw an error', async () => {
        const walletAddressToWithdraw = await regtestClient.createNodeWalletAddress('')
        await expect(unauthorizedRegtestClient.requestWithdrawal('', 10, walletAddressToWithdraw, WithdrawalMode.FUTURE_VALUE)).rejects.toThrowError()
    })

    /** TODO: CREATE A OPENING JUST-IN-TIME CHANNEL TEST. Should it be created using the `listenToTransactions` method? */
    test('Should open just-in-time channel from inbound payment', async () => {
        expect(true).toBe(true)
    })
})

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
        "should fetch the current account",
        async () => {
            const wallet = await regtestClient.getCurrentAccount();
            expect(wallet?.id).toBeDefined();
        },
        TESTS_TIMEOUT,
    );

    test(
        "should fetch the current account",
        async () => {
            const wallet = await regtestClient.getCurrentAccount();
            expect(wallet?.id).toBeDefined();
        },
        TESTS_TIMEOUT,
    );

    /** TODO: LISTEN CURRENT PAYMENT REQUESTS. I haven't found such methods, how I can perform this action? */
    test(
        "should listen current payment requests",
        () => {
            expect(true).toBe(true)
        },
        TESTS_TIMEOUT,
    );

    test(
        "should list recent transactions",
        async () => {
            const transactions = await regtestClient.getRecentTransactions('', PAGGING_STEP);

            expect(transactions.length).not.toBe(0);
        },
        TESTS_TIMEOUT,
    );

    /** TODO: FETCH AN ENTITY BY ID. How I can perform this action?  */
    test("should fetch an entity by ID", async () => {
        expect(true).toBe(true)
    })

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
    )

    test(
        "should create STANDARD a test mode invoice",
        async () => {
            testInvoice = await regtestClient.createTestModeInvoice('', 0, 'hi there!')
            expect(testInvoice).not.toBeNull()
        },
        TESTS_TIMEOUT,
    )

    test(
        "should create an AMP a test mode invoice",
        async () => {
            const testInvoice = await regtestClient.createTestModeInvoice('', 0, '', InvoiceType.AMP)
            expect(testInvoice).not.toBeNull()
        },
        TESTS_TIMEOUT,
    )

    test(
        "should create a FUTURE_VALUE a test mode invoice",
        async () => {
            const testInvoice = await regtestClient.createTestModeInvoice('', 0, '', InvoiceType.FUTURE_VALUE)
            expect(testInvoice).not.toBeNull()
        },
        TESTS_TIMEOUT,
    )

    test(
        "should create a clear memo test mode invoice",
        async () => {
            const testInvoice = await regtestClient.createTestModeInvoice('', 0,)
            expect(testInvoice).not.toBeNull()
        },
        TESTS_TIMEOUT,
    )

    test(
        "should pay a test mode invoice",
        async () => {
            const invoicePayment = await regtestClient.payInvoice('', testInvoice ?? '', MAX_FEE, )
            expect(testInvoice).not.toBeNull()
        },
        TESTS_TIMEOUT,
    )

    test(
        "should pay a test mode invoice with Msats amount",
        async () => {
            const testInvoiceForPaying = await regtestClient.createTestModeInvoice('', 0, 'hi there!')
            const invoicePayment = await regtestClient.payInvoice('', testInvoiceForPaying ?? '', MAX_FEE, TESTS_TIMEOUT, PAY_AMOUNT)
            expect(invoicePayment?.status).not.toBe(TransactionStatus.FAILED)
        },
        TESTS_TIMEOUT,
    )

    test(
        "should create a test mode payment",
        async () => {
            const invoiceForTestPayment = await regtestClient.createInvoice('', PAY_AMOUNT, 'hi there!')
            const payment = await regtestClient.createTestModePayment('', invoiceForTestPayment ?? '')
            expect(payment?.status).not.toBe(TransactionStatus.FAILED)
        },
        TESTS_TIMEOUT,
    )

})

describe("P2 tests", () => {
    test(
        "should get an bitcoin fee estimate",
        async () => {
            const fee = await regtestClient.getBitcoinFeeEstimate();
            expect(fee).not.toBeNull();
        },
        TESTS_TIMEOUT,
    )

    test("should send a keysend payment", async () => {
        const payment = await regtestClient.sendPayment('', '', TESTS_TIMEOUT, PAY_AMOUNT, MAX_FEE)
        expect(payment?.status).not.toBe(TransactionStatus.FAILED)
    })

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

})

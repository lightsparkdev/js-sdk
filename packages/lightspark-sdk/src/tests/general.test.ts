import {describe, expect, test} from "@jest/globals";
import {b64encode, DefaultCrypto,} from "@lightsparkdev/core";
import { getCredentialsFromEnvOrThrow } from "../env.js"
import {FRAGMENT} from "../objects/InvoiceData.js"
import {
    AccountTokenAuthProvider,
    BitcoinNetwork,
    InvoiceType, TransactionStatus, WithdrawalRequestStatus,
    WithdrawalMode
} from "../index.js"

import LightsparkClient from "../client.js";


const TEST_NAMES = {
    generalTestName: 'general',
}

const TESTS_TIMEOUT = 5000 //ms

const INVOICE_EXPIRY = 172800 //ms

const PAY_AMOUNT = 1000 //msats

const MAX_FEE = 10000000 //msats

const REGTEST_SIGNING_KEY_PASSWORD = '1234!@#$'

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

const TEST_TOKEN_TO_SEND = '018afaa2f44a4f890000a8b9b26bbe19'
const PROD_NODE_ID_TO_SEND = '018afaa310494f8900005c728dae5d65'
const TEST_API_TOKEN_TO_SEND = 'C3ZyMoPCDTCATExBkqybvxEZkqrys9vVoVKmidOn01s'
const PROD_API_TOKEN_TO_SEND = 'XG6hoMwKZd4E2VHDQM26WXvCBqp_mlXyCEQyeK8rUaM'

const { apiTokenClientId, apiTokenClientSecret, baseUrl } =
    getCredentialsFromEnvOrThrow();

let regtestClient: LightsparkClient
const unauthorizedRegtestClient = new LightsparkClient()

let testInvoice: string | null

let normalPaymentInvoice: string | undefined

let regtestNodeId: string | undefined

const testModeInvoices: Record<string, string | null> = {
    withMemo: null,
    withoutMemo: null
}

describe(TEST_NAMES.generalTestName, () => {
    test("should get env vars and construct the client successfully", async () => {
        const accountAuthProvider = new AccountTokenAuthProvider(
            apiTokenClientId,
            apiTokenClientSecret,
        );
        regtestClient = new LightsparkClient(accountAuthProvider, baseUrl);
        expect(regtestClient).toBeDefined();
    });

    test("should successfully get the current account regtest node", async () => {
        const account = await regtestClient.getCurrentAccount();
        const nodesConnection = await account?.getNodes(regtestClient, 1, [
            BitcoinNetwork.REGTEST,
        ]);

        const regtestNode = nodesConnection?.entities[0];
        regtestNodeId = regtestNode?.id;
        await regtestClient.loadNodeSigningKey(
            regtestNodeId ?? '',
            { password: REGTEST_SIGNING_KEY_PASSWORD }
        )
        expect(regtestNode).toBeDefined();
    });
})

describe("P0 tests", () => {

    test('Should create a normal payment invoice', async () => {
        normalPaymentInvoice = await regtestClient.createInvoice(regtestNodeId ?? '', PAY_AMOUNT, 'hi there!')
        expect(normalPaymentInvoice).toBeDefined()
    })

    test('Should create a AMP type invoice', async () => {
        const AmpPaymentInvoice =
            await regtestClient.createInvoice(regtestNodeId ?? '', PAY_AMOUNT, 'hi there!', InvoiceType.AMP)
        expect(AmpPaymentInvoice).toBeDefined()
    })

    test('Should create a invoice with custom expiration', async () => {
        const AmpPaymentInvoiceWithExpiration =
            await regtestClient.createInvoice(regtestNodeId ?? '', PAY_AMOUNT, 'hi there!', InvoiceType.STANDARD, INVOICE_EXPIRY)
        expect(AmpPaymentInvoiceWithExpiration).toBeDefined()
    })

    test('Should create an any payment amount invoice', async () => {
        const AnyPaymentAmountInvoice =
            await regtestClient.createInvoice(regtestNodeId ?? '', PAY_AMOUNT, 'hi there!', InvoiceType.STANDARD, INVOICE_EXPIRY)
        expect(AnyPaymentAmountInvoice).toBeDefined()
    })

    test("should throw an error on create an unauthorized invoice", async () => {
        await expect(
            unauthorizedRegtestClient.createInvoice(regtestNodeId ?? '', 0, 'hi there!'),
        ).rejects.toThrowError();
    });

    // test('Should pay an invoice', async () => {
    //     const AmpPaymentInvoiceWithExpiration = await regtestClient.payInvoice(regtestNodeId ?? '', normalPaymentInvoice ?? '', MAX_FEE, )
    //     expect(AmpPaymentInvoiceWithExpiration).toBeDefined()
    // })

    test('Should pay an invoice from unauthorized wallet and throw an error', async () => {
        await expect(
            unauthorizedRegtestClient.payInvoice(
                regtestNodeId ?? '',
                normalPaymentInvoice ?? '',
                MAX_FEE,
            )).rejects.toThrowError()
    })
    // FIXME: Request FundNode failed. [{"message":"Variable '$amountMsats' is not defined by operation 'FundNode'.","locations":[{"line":6,"column":60},{"line":2,"column":5}]},{"message":"Variable '$amountSats' is never used in operation 'FundNode'.","locations":[{"line":4,"column":9}]}]
    // test('Should deposit funds to wallet with a clear sats amount', async () => {
    //     const fundingResult = await regtestClient.fundNode(regtestNodeId ?? '')
    //     expect(true).toBe(true)
    // })
    //
    // FIXME: Request FundNode failed. [{"message":"Variable '$amountMsats' is not defined by operation 'FundNode'.","locations":[{"line":6,"column":60},{"line":2,"column":5}]},{"message":"Variable '$amountSats' is never used in operation 'FundNode'.","locations":[{"line":4,"column":9}]}]
    // test('Should deposit funds to wallet with a defined amount of sats', async () => {
    //     const fundingResult = await regtestClient.fundNode(regtestNodeId ?? '', 100000)
    //     expect(true).toBe(true)
    // })

    test('Should withdraw funds from unauthorized wallet and throw an error', async () => {
        await expect(unauthorizedRegtestClient.createNodeWalletAddress('')).rejects.toThrowError()
    })

    // /** TODO: CREATE A OPENING JUST-IN-TIME CHANNEL TEST. Should it be created using the `listenToTransactions` method? */
    // test('Should open just-in-time channel from inbound payment', async () => {
    //     expect(true).toBe(true)
    // })
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
    //
    test(
        "should fetch the current account",
        async () => {
            const wallet = await regtestClient.getCurrentAccount();
            expect(wallet?.id).toBeDefined();
        },
        TESTS_TIMEOUT,
    );
    //
    // /** TODO: LISTEN CURRENT PAYMENT REQUESTS. I haven't found such methods, how I can perform this action? */
    // test(
    //     "should listen current payment requests",
    //     () => {
    //         expect(true).toBe(true)
    //     },
    //     TESTS_TIMEOUT,
    // );
    //
    test(
        "should list recent transactions",
        async () => {
            const transactions = await regtestClient.getRecentTransactions(regtestNodeId ?? '', PAGGING_STEP);

            expect(transactions.length).not.toBe(0);
        },
        TESTS_TIMEOUT,
    );
    //
    // /** TODO: FETCH AN ENTITY BY ID. How I can perform this action?  */
    // test("should fetch an entity by ID", async () => {
    //     expect(true).toBe(true)
    // })
    //
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
            testModeInvoices.withMemo = await regtestClient.createTestModeInvoice(regtestNodeId ?? '', PAY_AMOUNT, 'hi there!')
            expect(testModeInvoices.withMemo).not.toBeNull()
        },
        TESTS_TIMEOUT,
    )

    test(
        "should create an AMP a test mode invoice",
        async () => {
            const testInvoice = await regtestClient.createTestModeInvoice(regtestNodeId ?? '', 0, '', InvoiceType.AMP)
            expect(testInvoice).not.toBeNull()
        },
        TESTS_TIMEOUT,
    )

    test(
        "should create a clear memo test mode invoice",
        async () => {
            testModeInvoices.withoutMemo = await regtestClient.createTestModeInvoice(regtestNodeId ?? '', 0)
            expect(testModeInvoices.withoutMemo).not.toBeNull()
        },
        TESTS_TIMEOUT,
    )

    test(
        "should pay a test mode invoice",
        async () => {
            const invoicePayment = await regtestClient.payInvoice(
                regtestNodeId ?? '',
                testModeInvoices.withoutMemo ?? '',
                MAX_FEE,
                TESTS_TIMEOUT,
                PAY_AMOUNT
            )
            expect(invoicePayment).toBeDefined()
        },
        TESTS_TIMEOUT,
    )

    test(
        "should create a test mode payment",
        async () => {
            const invoiceForTestPayment = await regtestClient.createTestModeInvoice(regtestNodeId ?? '', PAY_AMOUNT, 'hi there!')
            const payment = await regtestClient.createTestModePayment(regtestNodeId ?? '', invoiceForTestPayment ?? '')
            console.log(payment)
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

    // test("should send a keysend payment", async () => {
    //     const payment = await regtestClient.sendPayment(regtestNodeId ?? '', '', TESTS_TIMEOUT, PAY_AMOUNT, MAX_FEE)
    //     expect(payment?.status).not.toBe(TransactionStatus.FAILED)
    // })
    //
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

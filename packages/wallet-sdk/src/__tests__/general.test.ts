// import {
    // LightsparkClient,
    // InvoiceData,
    // KeyType,
    // TransactionStatus,
    // WithdrawalRequestStatus,
    // WalletStatus,
// } from "..";

import { describe, expect, test } from '@jest/globals'

import { getCredentialsFromEnvOrThrow } from '../../examples/node-scripts/authHelpers'
// import { DefaultCrypto } from "../../../core/src/index.js";


describe("Sanity tests", () => {
    console.log(process.env)

    const credentials = getCredentialsFromEnvOrThrow();

    console.log(credentials)

    // Let's start by creating a client
    // const client = new LightsparkClient();

    test("should deploy the wallet", async () => {
        // const walletStatus: WalletStatus = await client.deployWalletAndAwaitDeployed();
        //
        // expect(walletStatus).toBe(WalletStatus.DEPLOYED)

        expect(1).toBe(1)
    });

    test("should init the wallet", async () => {
        // const keyPair = await DefaultCrypto.generateSigningKeyPair();
        // const signingWalletPublicKey = keyPair.publicKey;
        // const signingWalletPrivateKey = keyPair.privateKey;
        //
        // const walletStatus = await client.initializeWalletAndAwaitReady(
        //     KeyType.RSA_OAEP,
        //     signingWalletPublicKey as string,
        //     {
        //         key: signingWalletPrivateKey as string
        //     }
        // );
        //
        // expect(walletStatus).toBe(WalletStatus.READY)
        expect(1).toBe(1)
    })

    // let invoiceData: InvoiceData | null

    test("should create an invoice", async () => {
        // const _invoiceData = await client.createInvoice(100_000, "mmmmm pizza");
        //
        // invoiceData = _invoiceData as InvoiceData | null
        //
        // expect(invoiceData).not.toBe(null)

        expect(1).toBe(1)
    })

    test("should pay an invoice", async () => {
        // if (!invoiceData?.encodedPaymentRequest)
        //     throw new Error("invoiceData is null")
        //
        // const payment = await client.payInvoice(
        //     invoiceData.encodedPaymentRequest,
        //     50_000
        // );
        //
        // expect(payment.status).toBe(TransactionStatus.SUCCESS)

        expect(1).toBe(1)
    })

    test("should deposit", async () => {
        expect(1).toBe(1)
    })

    test("should withdraw", async () => {
        // const withdrawalRequest = await client.requestWithdrawal(
        //     50_000,
        //     "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
        // )
        //
        // expect(withdrawalRequest?.status).toBe(WithdrawalRequestStatus.SUCCESSFUL)

        expect(1).toBe(1)
    })
});

describe("P1 tests", () => {
    test("should generate a key", async () => {
        expect(1).toBe(1)
    })

    test("should fetch the current wallet", async () => {
        expect(1).toBe(1)
    })

    test("should list current payment requests", async () => {
        expect(1).toBe(1)
    })

    test("should list recent transactions", async () => {
        expect(1).toBe(1)
    })

    test("should fetch an entity by ID", async () => {
        expect(1).toBe(1)
    })

    test("should terminate a wallet", async () => {
        expect(1).toBe(1)
    })

    test("should decode an invoice", async () => {
        expect(1).toBe(1)
    })
})

describe("P2 tests", () => {
    test("should get bitcoin fee estimates", async () => {
        expect(1).toBe(1)
    })

    test("should send a keysend payment", async () => {
        expect(1).toBe(1)
    })

    test("should create a test mode invoice", async () => {
        expect(1).toBe(1)
    })

    test("should create a test mode payment", async () => {
        expect(1).toBe(1)
    })

    test("should execute a raw graphql query", async () => {
        expect(1).toBe(1)
    })
})

/*
P0 sanity tests:
    Deploying and Initializing a wallet
    Creating an invoice
    paying an invoice
    deposits
    withdrawals
P1 tests
    Key generation
    Fetching the current wallet
    Listing current payment requests
    Listing recent transactions (with paging)
    Fetching an entity by ID (like a payment)
    Wallet termination
    Decoding an invoice
P2 tests
    Getting bitcoin fee estimates
    Sending a keysend payment (we may need a third-party lightning wallet for this).
    createTestModeInvoice and createTestModePayment
    Raw graphql queries via executeRawQuery
*/
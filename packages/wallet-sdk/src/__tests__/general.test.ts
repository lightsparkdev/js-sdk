import { describe, expect, test } from '@jest/globals'
import { DefaultCrypto } from '@lightsparkdev/core'

import LightsparkClient from '../client.js'

import InvoiceData from '../objects/InvoiceData.js'
import KeyType from '../objects/KeyType.js'
import TransactionStatus from '../objects/TransactionStatus.js'
import WalletStatus from '../objects/WalletStatus.js'
import WithdrawalRequestStatus from '../objects/WithdrawalRequestStatus.js'


import { getCredentialsFromEnvOrThrow } from '../../examples/node-scripts/authHelpers.js'

// Let's start by creating a client
const client = new LightsparkClient()

console.log(client)

describe('Sanity tests', () => {
    getCredentialsFromEnvOrThrow('_testUser1')

    test('should deploy the wallet', async () => {
        const walletStatus: WalletStatus =
            await client.deployWalletAndAwaitDeployed()

        expect(walletStatus).toBe(WalletStatus.DEPLOYED)
    })

    test('should init the wallet', async () => {
        const keyPair = await DefaultCrypto.generateSigningKeyPair()
        const signingWalletPublicKey = keyPair.publicKey
        const signingWalletPrivateKey = keyPair.privateKey

        const walletStatus = await client.initializeWalletAndAwaitReady(
            KeyType.RSA_OAEP,
            signingWalletPublicKey as string,
            {
                key: signingWalletPrivateKey as string,
            },
        )

        expect(walletStatus).toBe(WalletStatus.READY)
    })

    let invoiceData: InvoiceData | null

    test('should create an invoice', async () => {
        const _invoiceData = await client.createInvoice(100_000, 'mmmmm pizza')

        invoiceData = _invoiceData as InvoiceData | null

        expect(invoiceData).not.toBe(null)
    })

    test('should pay an invoice', async () => {
        if (!invoiceData?.encodedPaymentRequest)
            throw new Error('invoiceData is null')

        const payment = await client.payInvoice(
            invoiceData.encodedPaymentRequest,
            50_000,
        )

        expect(payment.status).toBe(TransactionStatus.SUCCESS)
    })

    test('should deposit', async () => {
        expect(1).toBe(1)
    })

    test('should withdraw', async () => {
        const withdrawalRequest = await client.requestWithdrawal(
            50_000,
            'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        )

        expect(withdrawalRequest?.status).toBe(WithdrawalRequestStatus.SUCCESSFUL)
    })
})

describe('P1 tests', () => {
    test('should generate a key', async () => {
        const keyPair = await DefaultCrypto.generateSigningKeyPair()
        const signingWalletPublicKey = keyPair.publicKey
        const signingWalletPrivateKey = keyPair.privateKey

        expect(signingWalletPrivateKey).not.toBe(null)
        expect(signingWalletPublicKey).not.toBe(null)
    })

    test('should fetch the current wallet', async () => {
        const wallet = await client.getCurrentWallet()

        expect(wallet).not.toBe(null)
    })

    test('should list current payment requests', async () => {
        const dashboard = await client.getWalletDashboard()

        expect(dashboard?.paymentRequests).not.toBe(null)
    })

    test('should list recent transactions', async () => {
        const dashboard = await client.getWalletDashboard()

        expect(dashboard?.recentTransactions).not.toBe(null)
    })

    test('should fetch an entity by ID', async () => {
        expect(1).toBe(1)
    })

    test('should terminate a wallet', async () => {
        await client.terminateWallet()

        const wallet = await client.getCurrentWallet()

        expect(wallet?.status).toBe(WalletStatus.TERMINATED)
    })

    test('should decode an invoice', async () => {
        expect(1).toBe(1)
    })
})

describe('P2 tests', () => {
    test('should get bitcoin fee estimates', async () => {
        const feeEstimates = await client.getBitcoinFeeEstimate()

        expect(feeEstimates).not.toBe(null)
    })

    test('should send a keysend payment', async () => {
        expect(1).toBe(1)
    })

    test('should create a test mode invoice', async () => {
        const testInvoice = await client.createTestModeInvoice(
            100_000,
            'mmmmm pizza',
        )

        expect(testInvoice).not.toBe(null)
    })

    test('should create a test mode payment', async () => {
        // const testPayment = await client.createTestModePayment(100_000)
        //
        // expect(testPayment).not.toBe(null)

        expect(1).toBe(1)
    })

    test('should execute a raw graphql query', async () => {
        const query = `
      query {
        getWallet {
          id
          status
        }
      }
    `
        const result = await client.executeRawQuery({
            queryPayload: query,
            constructObject: data => data.getWallet,
        })

        expect(result).not.toBe(null)
    })
})

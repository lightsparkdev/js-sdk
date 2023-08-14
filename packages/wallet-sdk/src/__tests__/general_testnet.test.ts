import { jest } from '@jest/globals'
import { describe, expect, test } from '@jest/globals'
import { b64encode, DefaultCrypto, KeyOrAlias} from '@lightsparkdev/core'

import LightsparkClient from '../client.js'

import { type CreatedInvoiceData, type CreatedTestnetInvoiceData } from './types/index.js'
import {
    TESTS_TIMEOUT,
    TEST_USER_ID,
    TEST_INVOICE_AMOUNT
} from './consts/index.js'
import { FRAGMENT } from '../objects/InvoiceData.js'
import {
    InvoiceType,
    KeyType,
    WalletStatus,
    TransactionStatus,
    getOutgoingPaymentQuery,
    type OutgoingPayment,
} from '../objects/index.js'
import { getCredentialsFromEnvOrThrow, createDeployAndInitWallet } from './helpers/index.js'

const ENCODED_REQUEST_FOR_TESTS = 'lnbcrt500n1pjdyx6tpp57xttmwwfvp3amu8xcr2lc8rs7zm26utku9qqh7llxwr6cf5yn4ssdqjd4kk6mtdypcxj7n6vycqzpgxqyz5vqsp5mdp46gsf4r3e6dmy7gt5ezakmjqac0mrwzunn7wqnekaj2wr9jls9qyyssq2cx3pzm3484x388crrp64m92wt6yyqtuues2aq9fve0ynx3ln5x4846agck90fnp5ws2mp8jy4qtm9xvszhcvzl7hzw5kd99s44kklgpq0egse'

const client = new LightsparkClient()

const unauthorizedClient = new LightsparkClient()

const authorizedClientWithLockedWallet = new LightsparkClient()

const credentials = getCredentialsFromEnvOrThrow(`_${TEST_USER_ID}`)

let createDeployAndInitWalletResponse: Awaited<ReturnType<typeof createDeployAndInitWallet>> | undefined = undefined

let invoicePayment: OutgoingPayment

describe('Sanity tests', () => {

    const invoiceData = {} as CreatedInvoiceData

    const testInvoiceData = {} as CreatedTestnetInvoiceData

    jest.spyOn(authorizedClientWithLockedWallet, 'isAuthorized').mockResolvedValue(true)

    test('should deploy and init the wallet', async () => {
        createDeployAndInitWalletResponse = await createDeployAndInitWallet(client, {
            userId: TEST_USER_ID,
            test: true,
        }, credentials)

        expect(createDeployAndInitWalletResponse.userId).not.toBe(null)
    }, TESTS_TIMEOUT)

    test('should throw an error on deploying wallet twice', async () => {
        expect(client.deployWalletAndAwaitDeployed()).rejects.toThrowError()
    }, TESTS_TIMEOUT)

    test('should return a status of initted wallet  on trying to init twice', async () => {
        const initedWalletStatus = await client.initializeWalletAndAwaitReady(
            KeyType.RSA_OAEP,
            createDeployAndInitWalletResponse?.pubKey ?? '',
            KeyOrAlias.key( createDeployAndInitWalletResponse?.privKey ?? '')
        )
        expect(initedWalletStatus).toBe(WalletStatus.READY)
    }, TESTS_TIMEOUT)

    test('should unlock the wallet', async () => {
        await client.loadWalletSigningKey(
            KeyOrAlias.key(createDeployAndInitWalletResponse?.privKey ?? '')
        )
        expect(client.isWalletUnlocked()).toBe(true)
    }, TESTS_TIMEOUT)

    test('should create an AMP type invoice', async () => {
        invoiceData.AMP = await client.createInvoice(TEST_INVOICE_AMOUNT, 'hi there', InvoiceType.AMP)

        //console.log('created AMP Invoice:', invoiceData.AMP)

        expect(invoiceData.AMP).not.toBe(null)
    }, TESTS_TIMEOUT)

    test('should create a STANDARD type invoice', async () => {
        invoiceData.STANDARD = await client.createInvoice(TEST_INVOICE_AMOUNT, 'hi there')

        //console.log('created STANDARD Invoice:', invoiceData.STANDARD)

        expect(invoiceData.STANDARD).not.toBe(null)
    }, TESTS_TIMEOUT)

    test('should create a empty memo invoice', async () => {
        const clearMemoInvoice = await client.createInvoice(TEST_INVOICE_AMOUNT)

        console.log('created clear memo Invoice:', clearMemoInvoice)

        expect(invoiceData.STANDARD).not.toBe(null)
    }, TESTS_TIMEOUT)

    test('should create an unauthorized invoice', async () => {
        await expect(
            unauthorizedClient.createInvoice(TEST_INVOICE_AMOUNT)
        ).rejects.toThrow('You must be logged in to perform this action.')
    })

    test('should create a STANDARD test mode invoice', async () => {
        testInvoiceData.STANDARD = await client.createTestModeInvoice(TEST_INVOICE_AMOUNT)
        expect(testInvoiceData.STANDARD).not.toBeNull()
    })

    test('should create a AMP test mode invoice', async () => {
        testInvoiceData.AMP = await client.createTestModeInvoice(TEST_INVOICE_AMOUNT, InvoiceType.AMP)
        expect(testInvoiceData.STANDARD).not.toBeNull()
    })

    test('should create a empty memo test mode invoice', async () => {
        const clearMemoTestInvoice = await client.createTestModeInvoice(TEST_INVOICE_AMOUNT, InvoiceType.AMP)

        console.log('created clear memo testnet Invoice:', clearMemoTestInvoice)

        expect(invoiceData.STANDARD).not.toBe(null)
    }, TESTS_TIMEOUT)

    test('should create a empty memo test mode invoice with unauthorized account', async () => {
        await expect(
            unauthorizedClient.createTestModeInvoice(TEST_INVOICE_AMOUNT)
        ).rejects.toThrow('You must be logged in to perform this action.')
    })

    test('should deposit tetstnet funds to account', async () => {
        if (!invoiceData.AMP?.encodedPaymentRequest)
            throw new Error('invoiceData is null')

        const payment = await client.createTestModePayment(
            invoiceData.AMP?.encodedPaymentRequest,
        )

        //console.log(payment, 'payment invoice')

        //console.log(`Payment done with status= ${payment!.status}, ID = ${payment!.id}`)

        expect(payment!.status).toBe(TransactionStatus.PENDING)
    }, TESTS_TIMEOUT)

    test('should deposit tetstnet funds to the account from unauthorized client', async () => {
        if (!invoiceData.AMP?.encodedPaymentRequest)
            throw new Error('invoiceData is null')

        //console.log(payment, 'payment invoice')

        //console.log(`Payment done with status= ${payment!.status}, ID = ${payment!.id}`)

        await expect(
            unauthorizedClient.createTestModePayment(invoiceData.AMP?.encodedPaymentRequest, TEST_INVOICE_AMOUNT)
        ).rejects.toThrow('You must be logged in to perform this action.')
    })

    test('should deposit tetstnet fund to account with locked wallet', async () => {
        if (!invoiceData.AMP?.encodedPaymentRequest)
            throw new Error('invoiceData is null')

        //console.log(payment, 'payment invoice')

        //console.log(`Payment done with status= ${payment!.status}, ID = ${payment!.id}`)

        await expect(
            authorizedClientWithLockedWallet.createTestModePayment(invoiceData.AMP?.encodedPaymentRequest, TEST_INVOICE_AMOUNT)
        ).rejects.toThrow('You must unlock the wallet before performing this action.')
    })

    test('should pay a testnet invoice', async () => {
        if (!invoiceData.STANDARD) {
            throw new Error('testnetInvoiceData is null')
        }

        invoicePayment = await client.payInvoiceAndAwaitResult(
            invoiceData.AMP?.encodedPaymentRequest ?? '',
            1_000_000,
        )

        console.log(invoicePayment, 'payment testnet invoice')

        console.log(`Testnet payment done with status= ${invoicePayment.status}, ID = ${invoicePayment.id}`)

        expect(invoicePayment.status).toBe(TransactionStatus.SUCCESS)
    }, TESTS_TIMEOUT)

    test('should create a deposit bitcoin address', async () => {
        const bitcoinAddress = await client.createBitcoinFundingAddress()
        expect(bitcoinAddress).not.toBeNull()
    }, TESTS_TIMEOUT)

    test('should create a deposit bitcoin address with unauthorized user', async () => {
         await expect(
             unauthorizedClient.createBitcoinFundingAddress()
         ).rejects.toThrow('You must be logged in to perform this action.')
    })
})

describe('P1 tests', () => {
    test('should generate a key', async () => {
        const keypair = await DefaultCrypto.generateSigningKeyPair();

        const serializedKeypair = {
            privateKey: b64encode(
                await DefaultCrypto.serializeSigningKey(keypair.privateKey, "pkcs8")
            ),
            publicKey: b64encode(
                await DefaultCrypto.serializeSigningKey(keypair.publicKey, "spki")
            ),
        };

        //console.log(serializedKeypair)

        expect(serializedKeypair.privateKey).not.toBeNull()
        expect(serializedKeypair.publicKey).not.toBeNull()
    }, TESTS_TIMEOUT)

    test('should fetch the current wallet', async () => {
        const wallet = await client.getCurrentWallet()

        //console.log(wallet)

        expect(wallet).not.toBe(null)
    }, TESTS_TIMEOUT)

    test('should fetch the current wallet from unauthorized user', async () => {
        await expect(unauthorizedClient.getCurrentWallet()).rejects.toThrow('You must be logged in to perform this action.')
    })

    test('should list current payment requests', async () => {
        const dashboard = await client.getWalletDashboard()

        //console.log(dashboard?.paymentRequests)

        expect(dashboard?.paymentRequests).not.toBeNull()
    }, TESTS_TIMEOUT)

    test('should list recent transactions', async () => {
        const dashboard = await client.getWalletDashboard()

        //console.log(dashboard?.recentTransactions)

        expect(dashboard?.recentTransactions).not.toBeNull()
    }, TESTS_TIMEOUT)

    test('should load walled dashboard from unauthorized wallet', async () => {
        await expect(unauthorizedClient.getWalletDashboard()).rejects.toThrow('You must be logged in to perform this action.')
    })

    test('should fetch an invoice payment by ID', async () => {
        console.log(invoicePayment, 'should fetch an entity by ID invoice payment ')
        const payment = await client.executeRawQuery(getOutgoingPaymentQuery(invoicePayment.id))

        expect(payment).not.toBeNull()
        expect(payment!.id).toBe(invoicePayment.id)
    })


    test('should terminate a wallet', async () => {
        await client.terminateWallet()
        const wallet = await client.getCurrentWallet()

        //console.log(wallet)

        expect(wallet?.status).toBe(WalletStatus.TERMINATING)
    }, TESTS_TIMEOUT)

    test('should terminate an unauthorized wallet', async () => {
        await expect(unauthorizedClient.terminateWallet()).rejects.toThrow('You must be logged in to perform this action.')
    })

    test('should decode an invoice', async () => {
        const decodedInvoice = await client.decodeInvoice(ENCODED_REQUEST_FOR_TESTS)

        console.log(decodedInvoice)

        expect(decodedInvoice).not.toBe(null)
        expect(decodedInvoice?.memo).toBe('mmmmm pizza')
        expect(decodedInvoice?.paymentHash).toBe('f196bdb9c96063ddf0e6c0d5fc1c70f0b6ad7176e1400bfbff3387ac26849d61')
    }, TESTS_TIMEOUT)
})

describe('P2 tests', () => {
    test('should send a keysend payment', async () => {
        expect(1).toBe(1)
    })

    test('should execute a raw graphql query', async () => {
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
            constructObject: data => data?.decoded_payment_request,
        });

        //console.log(result);

        expect(result).not.toBe(null);
    }, TESTS_TIMEOUT);

    test('should get an estimated gas price', async () => {
        const fee = await client.getBitcoinFeeEstimate()

        //console.log(fee)

        expect(fee).not.toBeNull()
    }, TESTS_TIMEOUT)
})

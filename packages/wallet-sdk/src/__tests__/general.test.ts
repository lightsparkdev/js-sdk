import { describe, expect, test } from '@jest/globals'
import {b64encode, DefaultCrypto, KeyOrAlias} from '@lightsparkdev/core'

import LightsparkClient from '../client.js'

import type InvoiceData from '../objects/InvoiceData.js'
import KeyType from '../objects/KeyType.js'
import TransactionStatus from '../objects/TransactionStatus.js'
import WalletStatus from '../objects/WalletStatus.js'
import WithdrawalRequestStatus from '../objects/WithdrawalRequestStatus.js'

import { getCredentialsFromEnvOrThrow } from '../../examples/node-scripts/authHelpers.js'
import { LocalStorageJwtStorage } from '../auth/index.js'

import jwt from 'jsonwebtoken'
import {type EnvCredentials} from "@lightsparkdev/wallet-cli/src/authHelpers.js";
import {confirm, input} from "@inquirer/prompts";
import {InMemoryJwtStorage} from "../../dist/index.js";

const test_userId = '_testUser1'

const createWalletJwt = async (
    client: LightsparkClient,
    options: Record<string, any>,
    credentials?: EnvCredentials
) => {
    console.log("Creating wallet JWT...\n");
    const privateKey = credentials?.jwtSigningPrivateKey;

    if (!privateKey) {
        throw new Error(
            "JWT signing private key not found in environment. Set LIGHTSPARK_JWT_PRIV_KEY."
        );
    }

    let userId = options.userId;
    let test = options.test;

    if (!options.userId) {
        userId = await input({
            message: "Enter a unique user ID for the wallet: ",
        });
        test = await confirm({ message: "Use test environment?" });
    }

    const claims = {
        aud: "https://api.lightspark.com",
        // Any unique identifier for the user.
        sub: userId,
        // True to use the test environment, false to use production.
        test: options.test,
        iat: Math.floor(Date.now() / 1000),
        // Expiration time for the JWT is 30 days from now.
        exp: options.expireAt ?? Math.floor(Date.now() / 1000 + 60 * 5),
    };

    if (options.extraProps) {
        const extraProps = JSON.parse(options.extraProps);
        Object.assign(claims, extraProps);
    }

    console.log("claims", claims);

    const token = jwt.sign(claims, privateKey, { algorithm: "ES256" });

    console.log("Account ID:", credentials.accountId);
    console.log("JWT:", token);

    return { token, userId, test };
};

const createDeployAndInitWallet = async (
    client: LightsparkClient,
    options: Record<string, any>,
    credentials?: EnvCredentials
) => {
    if (!credentials) {
        throw new Error("Credentials not found in environment.");
    }

    const { token, userId, test } = await createWalletJwt(
        client,
        options,
        credentials
    );

    console.log('here')
    console.log(token, userId, test)

    console.log("Creating wallet...\n");

    const loginOutput = await client.loginWithJWT(
        credentials.accountId,
        token,
        new InMemoryJwtStorage()
    );

    console.log("Wallet:", JSON.stringify(loginOutput.wallet, null, 2));

    let serializedKeypair: { privateKey: string; publicKey: string } | undefined =
        undefined

    let deployedResultStatus: WalletStatus = loginOutput.wallet.status;

    if (loginOutput.wallet.status === WalletStatus.NOT_SETUP) {
        console.log("Deploying wallet...\n");

        deployedResultStatus = await client.deployWalletAndAwaitDeployed();

        console.log(
            "Deployed wallet:",
            JSON.stringify(deployedResultStatus, null, 2)
        );
    }

    if (deployedResultStatus === WalletStatus.DEPLOYED) {
        console.log("Initializing wallet...\n");

        const keypair = await DefaultCrypto.generateSigningKeyPair();

        serializedKeypair = {
            privateKey: b64encode(
                await DefaultCrypto.serializeSigningKey(keypair.privateKey, "pkcs8")
            ),
            publicKey: b64encode(
                await DefaultCrypto.serializeSigningKey(keypair.publicKey, "spki")
            ),
        };

        console.log("Keypair:", JSON.stringify(serializedKeypair, null, 2));
        console.log("Initializing wallet now. This will take a while...\n");
        const initializedWallet = await client.initializeWalletAndAwaitReady(
            KeyType.RSA_OAEP,
            serializedKeypair.publicKey,
            KeyOrAlias.key(serializedKeypair.privateKey)
        );
        console.log(
            "Initialized wallet:",
            JSON.stringify(initializedWallet, null, 2)
        );
    } else {
        console.log(
            `Not initializing because the wallet status is ${loginOutput.wallet.status}`
        );
    }

    console.log(
        "\n\nExport these env vars to use this wallet. Appending to ~/.lightsparkenv:\n"
    );
    let content = `\n# Wallet for user ${userId}:\n# accountID: ${credentials.accountId}\n# test: ${test}\n`;
    content += `export LIGHTSPARK_JWT_${userId}="${token}"\n`;
    process.env[`LIGHTSPARK_JWT_${userId}`] = token;
    if (serializedKeypair) {
        content += `export LIGHTSPARK_WALLET_PRIV_KEY_${userId}="${serializedKeypair?.privateKey}"\n`;
        content += `export LIGHTSPARK_WALLET_PUB_KEY_${userId}="${serializedKeypair?.publicKey}"\n`;

        process.env[`LIGHTSPARK_WALLET_PRIV_KEY_${userId}`] =
            serializedKeypair.privateKey;
        process.env[`LIGHTSPARK_WALLET_PUB_KEY_${userId}`] =
            serializedKeypair.publicKey;
    }

    console.log(content);

    return {
        userId,
    }
};

// Let's start by creating a client
const client = new LightsparkClient()

const credentials = getCredentialsFromEnvOrThrow('_testUser1')

describe('Sanity tests', () => {

    test('should deploy the wallet', async () => {
        const { userId } = await createDeployAndInitWallet(client, {
            userId: test_userId,
            test: true,
        }, credentials)

        expect(userId).not.toBe(null)
    }, 600_000)

    // test('should init the wallet', async () => {
    //     const keyPair = await DefaultCrypto.generateSigningKeyPair()
    //     const signingWalletPublicKey = keyPair.publicKey
    //     const signingWalletPrivateKey = keyPair.privateKey
    //
    //     const walletStatus = await client.initializeWalletAndAwaitReady(
    //         KeyType.RSA_OAEP,
    //         signingWalletPublicKey as string,
    //         {
    //             key: signingWalletPrivateKey as string,
    //         },
    //     )
    //
    //     expect(walletStatus).toBe(WalletStatus.READY)
    // })
    //
    // let invoiceData: InvoiceData | null
    //
    // test('should create an invoice', async () => {
    //     const _invoiceData = await client.createInvoice(100_000, 'mmmmm pizza')
    //
    //     invoiceData = _invoiceData as InvoiceData | null
    //
    //     expect(invoiceData).not.toBe(null)
    // })
    //
    // test('should pay an invoice', async () => {
    //     if (!invoiceData?.encodedPaymentRequest)
    //         throw new Error('invoiceData is null')
    //
    //     const payment = await client.payInvoice(
    //         invoiceData.encodedPaymentRequest,
    //         50_000,
    //     )
    //
    //     expect(payment.status).toBe(TransactionStatus.SUCCESS)
    // })
    //
    // test('should deposit', async () => {
    //     expect(1).toBe(1)
    // })
    //
    // test('should withdraw', async () => {
    //     const withdrawalRequest = await client.requestWithdrawal(
    //         50_000,
    //         'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    //     )
    //
    //     expect(withdrawalRequest?.status).toBe(WithdrawalRequestStatus.SUCCESSFUL)
    // })
})

// describe('P1 tests', () => {
//     test('should generate a key', async () => {
//         const keyPair = await DefaultCrypto.generateSigningKeyPair()
//         const signingWalletPublicKey = keyPair.publicKey
//         const signingWalletPrivateKey = keyPair.privateKey
//
//         expect(signingWalletPrivateKey).not.toBe(null)
//         expect(signingWalletPublicKey).not.toBe(null)
//     })
//
//     test('should fetch the current wallet', async () => {
//         const wallet = await client.getCurrentWallet()
//
//         expect(wallet).not.toBe(null)
//     })
//
//     test('should list current payment requests', async () => {
//         const dashboard = await client.getWalletDashboard()
//
//         expect(dashboard?.paymentRequests).not.toBe(null)
//     })
//
//     test('should list recent transactions', async () => {
//         const dashboard = await client.getWalletDashboard()
//
//         expect(dashboard?.recentTransactions).not.toBe(null)
//     })
//
//     test('should fetch an entity by ID', async () => {
//         expect(1).toBe(1)
//     })
//
//     test('should terminate a wallet', async () => {
//         await client.terminateWallet()
//
//         const wallet = await client.getCurrentWallet()
//
//         expect(wallet?.status).toBe(WalletStatus.TERMINATED)
//     })
//
//     test('should decode an invoice', async () => {
//         expect(1).toBe(1)
//     })
// })
//
// describe('P2 tests', () => {
//     test('should get bitcoin fee estimates', async () => {
//         const feeEstimates = await client.getBitcoinFeeEstimate()
//
//         expect(feeEstimates).not.toBe(null)
//     })
//
//     test('should send a keysend payment', async () => {
//         expect(1).toBe(1)
//     })
//
//     test('should create a test mode invoice', async () => {
//         const testInvoice = await client.createTestModeInvoice(
//             100_000,
//             'mmmmm pizza',
//         )
//
//         expect(testInvoice).not.toBe(null)
//     })
//
//     test('should create a test mode payment', async () => {
//         // const testPayment = await client.createTestModePayment(100_000)
//         //
//         // expect(testPayment).not.toBe(null)
//
//         expect(1).toBe(1)
//     })
//
//     test('should execute a raw graphql query', async () => {
//         const query = `
//       query {
//         getWallet {
//           id
//           status
//         }
//       }
//     `
//         const result = await client.executeRawQuery({
//             queryPayload: query,
//             constructObject: data => data.getWallet,
//         })
//
//         expect(result).not.toBe(null)
//     })
// })

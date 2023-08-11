// import {describe, expect, test} from '@jest/globals'
// import {b64encode, DefaultCrypto, KeyOrAlias} from '@lightsparkdev/core'
//
// import LightsparkClient from '../client.js'
//
// import type InvoiceData from '../objects/InvoiceData.js'
// import KeyType from '../objects/KeyType.js'
// import TransactionStatus from '../objects/TransactionStatus.js'
// import WalletStatus from '../objects/WalletStatus.js'
//
// import jwt from 'jsonwebtoken'
// import {type EnvCredentials} from "@lightsparkdev/wallet-cli/src/authHelpers.js";
// import {confirm, input} from "@inquirer/prompts";
// import {InMemoryJwtStorage} from "../../dist/index.js";
// import fs from 'fs'
// import {InvoiceType, WithdrawalRequestStatus} from "../objects/index.js";
// import { FRAGMENT } from "../objects/InvoiceData.js";
// import type FeeEstimate from "../objects/FeeEstimate.js";
//
// export function sleep(ms: number): Promise<void> {
//     return new Promise(resolve => setTimeout(resolve, ms))
// }
//
// // TODO: DELETE IF IT'S NOT USING
// export const loadValueFromENVKey = (path: string, fromKey: string) => {
//     const fileContents = fs.readFileSync(path, 'utf8');
//     const lines = fileContents.split('\n');
//     const foundLine = lines.find(line => line.startsWith(`export ${fromKey}`))
//     return foundLine ? foundLine.split('"')[1] : ''
// }
//
// export const getCredentialsFromEnvOrThrow = (
//     walletEnvSuffix: string = ``
// ): {
//     accountId: string;
//     jwt: string;
//     pubKey?: string;
//     privKey?: string;
//     baseUrl: string;
//     jwtSigningPrivateKey?: string;
// } => {
//     console.log(process.env)
//     console.log(process.env.LIGHTSPARK_ACCOUNT_ID)
//
//     const accountId = process.env[`LIGHTSPARK_ACCOUNT_ID`];
//     const jwtSigningPrivateKey = process.env[`LIGHTSPARK_JWT_PRIV_KEY`];
//     const jwt = process.env[`LIGHTSPARK_JWT${walletEnvSuffix}`] ?? '';
//     const pubKey = process.env[`LIGHTSPARK_WALLET_PUB_KEY${walletEnvSuffix}`];
//     const privKey = process.env[`LIGHTSPARK_WALLET_PRIV_KEY${walletEnvSuffix}`];
//     const baseUrl =
//         process.env[`LIGHTSPARK_EXAMPLE_BASE_URL`] || `api.lightspark.com`;
//     if (!accountId || !jwtSigningPrivateKey) {
//         throw new Error(
//             `Missing test credentials. Please set LIGHTSPARK_ACCOUNT_ID and LIGHTSPARK_JWT_PRIV_KEY.`
//         );
//     }
//     return {
//         accountId,
//         jwt,
//         pubKey,
//         privKey,
//         baseUrl,
//         jwtSigningPrivateKey,
//     };
// };
//
// const test_userId = 'abshdjb32bhbdjhasbh3'
// const filePath = process.env.HOME + `/.lightsparkenv`
//
// const createWalletJwt = async (
//     client: LightsparkClient,
//     options: Record<string, any>,
//     credentials?: EnvCredentials
// ) => {
//     const privateKey = credentials?.jwtSigningPrivateKey;
//
//     if (!privateKey) {
//         throw new Error(
//             "JWT signing private key not found in environment. Set LIGHTSPARK_JWT_PRIV_KEY."
//         );
//     }
//
//     let userId = options.userId;
//     let test = options.test;
//
//     if (!options.userId) {
//         userId = await input({
//             message: "Enter a unique user ID for the wallet: ",
//         });
//         test = await confirm({ message: "Use test environment?" });
//     }
//
//     const claims = {
//         aud: "https://api.lightspark.com",
//         // Any unique identifier for the user.
//         sub: userId,
//         // True to use the test environment, false to use production.
//         test: options.test,
//         iat: Math.floor(Date.now() / 1000),
//         // Expiration time for the JWT is 30 days from now.
//         exp: options.expireAt ?? Math.floor(Date.now() / 1000 + 60 * 5),
//     };
//
//     if (options.extraProps) {
//         const extraProps = JSON.parse(options.extraProps);
//         Object.assign(claims, extraProps);
//     }
//
//     const token = jwt.sign(claims, privateKey, { algorithm: "ES256" });
//
//     return { token, userId, test };
// };
//
// const createDeployAndInitWallet = async (
//     client: LightsparkClient,
//     options: Record<string, any>,
//     credentials?: EnvCredentials
// ) => {
//     if (!credentials) {
//         throw new Error("Credentials not found in environment.");
//     }
//
//     const { token, userId, test } = await createWalletJwt(
//         client,
//         options,
//         credentials
//     );
//
//     const loginOutput = await client.loginWithJWT(
//         credentials.accountId,
//         token,
//         new InMemoryJwtStorage()
//     );
//
//     let serializedKeypair: { privateKey: string; publicKey: string } | undefined =
//         undefined
//
//     let walletStatus: WalletStatus | undefined = loginOutput.wallet.status
//
//     if (loginOutput.wallet.status === WalletStatus.NOT_SETUP) {
//         walletStatus = await client.deployWalletAndAwaitDeployed();
//     }
//
//     do {
//         walletStatus = (await client.getCurrentWallet())?.status;
//
//         console.log('walletStatus', walletStatus)
//
//         if (walletStatus === WalletStatus.DEPLOYED || walletStatus === WalletStatus.READY) {
//             const keypair = await DefaultCrypto.generateSigningKeyPair();
//
//             serializedKeypair = {
//                 privateKey: b64encode(
//                     await DefaultCrypto.serializeSigningKey(keypair.privateKey, "pkcs8")
//                 ),
//                 publicKey: b64encode(
//                     await DefaultCrypto.serializeSigningKey(keypair.publicKey, "spki")
//                 ),
//             };
//
//             console.log('serializedKeypair', serializedKeypair)
//             await client.initializeWalletAndAwaitReady(
//                 KeyType.RSA_OAEP,
//                 serializedKeypair.publicKey,
//                 KeyOrAlias.key(serializedKeypair.privateKey)
//             );
//         }
//
//         await sleep(30_000)
//     } while (walletStatus === WalletStatus.INITIALIZING || walletStatus === WalletStatus.DEPLOYING)
//
//     if (walletStatus !== WalletStatus.DEPLOYED && walletStatus !== WalletStatus.READY) {
//         console.log(
//             `Not initializing because the wallet status is ${loginOutput.wallet.status}`
//         );
//     }
//
//     let content = `\n# Wallet for user ${userId}:\n# accountID: ${credentials.accountId}\n# test: ${test}\n`;
//
//     content += `export LIGHTSPARK_JWT_${userId}="${token}"\n`;
//     // process.env[`LIGHTSPARK_JWT_${userId}`] = token;
//     if (serializedKeypair) {
//         content += `export LIGHTSPARK_WALLET_PRIV_KEY_${userId}="${serializedKeypair?.privateKey}"\n`;
//         content += `export LIGHTSPARK_WALLET_PUB_KEY_${userId}="${serializedKeypair?.publicKey}"\n`;
//
//         // process.env[`LIGHTSPARK_WALLET_PRIV_KEY_${userId}`] =
//         //     serializedKeypair.privateKey;
//         // process.env[`LIGHTSPARK_WALLET_PUB_KEY_${userId}`] =
//         //     serializedKeypair.publicKey;
//
//         fs.appendFile(filePath, content, () => null);
//     }
//
//     console.log(content);
//
//     return {
//         userId,
//
//         jwt: token,
//         pubKey: serializedKeypair?.publicKey,
//         privKey: serializedKeypair?.privateKey,
//     }
// };
//
// // Let's start by creating a client
// const client = new LightsparkClient()
//
// const credentials = getCredentialsFromEnvOrThrow(`_${test_userId}`)
//
// let createDeployAndInitWalletResponse: Awaited<ReturnType<typeof createDeployAndInitWallet>> | undefined = undefined
//
// describe('Sanity tests', () => {
//
//     test('should deploy and init the wallet', async () => {
//         createDeployAndInitWalletResponse = await createDeployAndInitWallet(client, {
//             userId: test_userId,
//             test: true,
//         }, credentials)
//
//         expect(createDeployAndInitWalletResponse.userId).not.toBe(null)
//     }, 900_000)
//
//     test('should unlock the wallet', async () => {
//         await client.loadWalletSigningKey(
//             KeyOrAlias.key(createDeployAndInitWalletResponse?.privKey ?? '')
//         )
//         expect(client.isWalletUnlocked()).toBe(true)
//     }, 900_000)
//
//     let fee: FeeEstimate | null
//     let invoiceData: InvoiceData | null
//     const invoiceAmount = 50 * 1000
//
//     test('should create an invoice', async () => {
//         invoiceData = await client.createInvoice(invoiceAmount, 'hi there', InvoiceType.AMP)
//
//         console.log('created Invoice:', invoiceData)
//
//         expect(invoiceData).not.toBe(null)
//     }, 900_000)
//
//     test('shoud get an estimated gas price', async () => {
//         fee = await client.getBitcoinFeeEstimate()
//
//         console.log(fee)
//
//         expect(fee).not.toBeNull()
//     })
//
//     test('should pay an invoice', async () => {
//         if (!invoiceData?.encodedPaymentRequest)
//             throw new Error('invoiceData is null')
//
//         // const invoiceFee = await client.getLightningFeeEstimateForInvoice(
//         //     invoiceData?.encodedPaymentRequest,
//         // )
//         // console.log('estimated fee from invoice: ', invoiceFee)
//         // const payment = await client.createTestModePayment(
//         //     invoiceData?.encodedPaymentRequest,
//         //     invoiceFee!.originalValue * 1000
//         // )
//
//         const payment = await client.createTestModePayment(
//                 invoiceData?.encodedPaymentRequest,
//         )
//
//         console.log(payment, 'payment invoice')
//
//         console.log(`Payment done with status= ${payment!.status}, ID = ${payment!.id}`)
//
//         expect(payment!.status).toBe(TransactionStatus.SUCCESS)
//     })
//
//     let bitcoinAddress: string | null
//
//     test('should create a deposit bitcoin address', async () => {
//         bitcoinAddress = await client.createBitcoinFundingAddress()
//         const dashboard = await client.getWalletDashboard()
//         expect(bitcoinAddress).not.toBeNull()
//     })
//
//     test('should withdraw', async () => {
//         const withdrawalRequest = await client.requestWithdrawal(
//             50_000,
//             'bcrt1q3xfwwx8lwuemslej3qedfyf8fqpz6pjhjl4pze',
//         )
//
//         console.log(withdrawalRequest, bitcoinAddress)
//
//         expect(withdrawalRequest?.status).toBe(WithdrawalRequestStatus.SUCCESSFUL)
//     })
// })
//
// describe('P1 tests', () => {
//     test('should generate a key', async () => {
//         const keypair = await DefaultCrypto.generateSigningKeyPair();
//
//         const serializedKeypair = {
//             privateKey: b64encode(
//                 await DefaultCrypto.serializeSigningKey(keypair.privateKey, "pkcs8")
//             ),
//             publicKey: b64encode(
//                 await DefaultCrypto.serializeSigningKey(keypair.publicKey, "spki")
//             ),
//         };
//
//         console.log(serializedKeypair)
//
//         expect(serializedKeypair.privateKey).not.toBe(null)
//         expect(serializedKeypair.publicKey).not.toBe(null)
//     })
//
//     test('should fetch the current wallet', async () => {
//         const wallet = await client.getCurrentWallet()
//
//         console.log(wallet)
//
//         expect(wallet).not.toBe(null)
//     })
//
//     test('should list current payment requests', async () => {
//         const dashboard = await client.getWalletDashboard()
//
//         console.log(dashboard?.paymentRequests)
//
//         expect(dashboard?.paymentRequests).not.toBe(null)
//     })
//
//     test('should list recent transactions', async () => {
//         const dashboard = await client.getWalletDashboard()
//
//         console.log(dashboard?.recentTransactions)
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
//         console.log('terminateeeeeee')
//
//         const wallet = await client.getCurrentWallet()
//
//         console.log(wallet)
//
//         expect(wallet?.status).toBe(WalletStatus.TERMINATING)
//     })
//
//     test('should decode an invoice', async () => {
//         const encodedRequest = `lnbcrt500n1pjdyx6tpp57xttmwwfvp3amu8xcr2lc8rs7zm26utku9qqh7llxwr6cf5yn4ssdqjd4kk6mtdypcxj7n6vycqzpgxqyz5vqsp5mdp46gsf4r3e6dmy7gt5ezakmjqac0mrwzunn7wqnekaj2wr9jls9qyyssq2cx3pzm3484x388crrp64m92wt6yyqtuues2aq9fve0ynx3ln5x4846agck90fnp5ws2mp8jy4qtm9xvszhcvzl7hzw5kd99s44kklgpq0egse`
//
//         const decodedInvoice = await client.decodeInvoice(encodedRequest)
//
//         console.log(decodedInvoice)
//
//         expect(decodedInvoice).not.toBe(null)
//         expect(decodedInvoice?.memo).toBe('mmmmm pizza')
//         expect(decodedInvoice?.paymentHash).toBe('f196bdb9c96063ddf0e6c0d5fc1c70f0b6ad7176e1400bfbff3387ac26849d61')
//     })
// })
//
// describe('P2 tests', () => {
//     test('should send a keysend payment', async () => {
//         expect(1).toBe(1)
//     })
//
//     let testInvoice: string | null
//     const testPaymentAmount = 10 * 1000
//
//     test('should create a test mode invoice', async () => {
//         testInvoice = await client.createTestModeInvoice(
//             testPaymentAmount,
//             'hi there',
//             InvoiceType.AMP
//         )
//
//         console.log(testInvoice, testInvoice)
//
//         expect(testInvoice).not.toBe(null)
//     }, 900_000)
//
//     test('should create a test mode payment', async () => {
//         const testPayment = await client.createTestModePayment(testInvoice!)
//
//         console.log(testPayment)
//
//         expect(testPayment).not.toBe(null)
//     })
//
//     test('should execute a raw graphql query', async () => {
//         const query = `
//               query DecodeInvoice($encoded_payment_request: String!) {
//                 decoded_payment_request(encoded_payment_request: $encoded_payment_request) {
//                   __typename
//                   ... on InvoiceData {
//                     ...InvoiceDataFragment
//                   }
//                 }
//               }
//
//             ${FRAGMENT}
//         `;
//
//         const result = await client.executeRawQuery({
//             queryPayload: query,
//             variables: {
//                 encoded_payment_request: 'lnbcrt500n1pjdyx6tpp57xttmwwfvp3amu8xcr2lc8rs7zm26utku9qqh7llxwr6cf5yn4ssdqjd4kk6mtdypcxj7n6vycqzpgxqyz5vqsp5mdp46gsf4r3e6dmy7gt5ezakmjqac0mrwzunn7wqnekaj2wr9jls9qyyssq2cx3pzm3484x388crrp64m92wt6yyqtuues2aq9fve0ynx3ln5x4846agck90fnp5ws2mp8jy4qtm9xvszhcvzl7hzw5kd99s44kklgpq0egse',
//             },
//             constructObject: data => data?.encoded_payment_request,
//         });
//
//         console.log(result);
//
//         expect(result).not.toBe(null);
//     });
// })

import {test} from "@jest/globals";

describe('Sanity tests', () => {
    test('sanity check', () => {
        expect(1).toBe(1)
    })
})

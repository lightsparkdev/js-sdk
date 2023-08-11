import jwt from 'jsonwebtoken'
import fs from 'fs'

import { b64encode, DefaultCrypto, KeyOrAlias } from '@lightsparkdev/core'
import { type EnvCredentials } from '@lightsparkdev/wallet-cli/src/authHelpers.js'

import type LightsparkClient from '../../client.js'
import WalletStatus from '../../objects/WalletStatus.js'
import KeyType from '../../objects/KeyType.js'

import { InMemoryJwtStorage } from '../../../dist/index.js'
import { LIGHTSPARK_ENV_PATH, MINUTES_IN_HOUR, MS_IN_MINUTE } from '../consts/index.js'
import { sleep } from './time.helpers.js'
import { type CredentialsForWalletJWTCreating, type OptionsForWalletJWTCreating, type SerializedKeyPair } from '../types/index.js'

const WALLET_STATUS_TIMEOUT = 30_000

const HOURS_BEFORE_EXPIRE = 5

export const initWallet = async (client: LightsparkClient, walletStatus?: WalletStatus): Promise<SerializedKeyPair | undefined> => {
    if(!walletStatus) throw new Error('Wallet status is undefined')

    if(walletStatus !== WalletStatus.DEPLOYED && walletStatus !== WalletStatus.READY) return

    const generatedKeypair = await DefaultCrypto.generateSigningKeyPair()

    const serializedKeypair = {
        privateKey: b64encode(
            await DefaultCrypto.serializeSigningKey(generatedKeypair.privateKey, "pkcs8")
        ),
        publicKey: b64encode(
            await DefaultCrypto.serializeSigningKey(generatedKeypair.publicKey, "spki")
        ),
    };

    console.log('serializedKeypair', serializedKeypair)

    await client.initializeWalletAndAwaitReady(
        KeyType.RSA_OAEP,
        serializedKeypair.publicKey,
        KeyOrAlias.key(serializedKeypair.privateKey)
    )

    return serializedKeypair
}

export const createWalletJwt = async (
    createCredentials: CredentialsForWalletJWTCreating
) => {
    const { options, credentials } = createCredentials
    const { userId, test } = options

    const privateKey = credentials?.jwtSigningPrivateKey

    if (!privateKey) {
        throw new Error(
            "JWT signing private key not found in environment. Set LIGHTSPARK_JWT_PRIV_KEY."
        );
    }

    const claims = {
        aud: "https://api.lightspark.com",
        sub: userId,
        test: options.test,
        iat: Math.floor(Date.now() / MS_IN_MINUTE),
        exp: Math.floor(Date.now() / MS_IN_MINUTE + MINUTES_IN_HOUR * HOURS_BEFORE_EXPIRE),
    }

    const token = jwt.sign(claims, privateKey, { algorithm: 'ES256' })

    return { token, userId, test };
};

export const createDeployAndInitWallet = async (
    client: LightsparkClient,
    options: OptionsForWalletJWTCreating,
    credentials?: EnvCredentials
) => {
    if (!credentials) {
        throw new Error("Credentials not found in environment.");
    }

    const { token, userId, test } = await createWalletJwt( {
        client,
        options,
        credentials
    })

    const loginOutput = await client.loginWithJWT(
        credentials.accountId,
        token,
        new InMemoryJwtStorage()
    )

    let walletStatus= loginOutput.wallet.status

    if (loginOutput.wallet.status === WalletStatus.NOT_SETUP) {
        walletStatus = await client.deployWalletAndAwaitDeployed();
    }

    while (walletStatus === WalletStatus.INITIALIZING || walletStatus === WalletStatus.DEPLOYING) {
        await sleep(WALLET_STATUS_TIMEOUT)
        const currentWallet = await client.getCurrentWallet()
        if(currentWallet) {
            walletStatus = currentWallet.status
        }
    }

    const serializedKeypair = await initWallet(client, walletStatus)

    if (walletStatus !== WalletStatus.DEPLOYED && walletStatus !== WalletStatus.READY) {
        console.log(
            `Not initializing because the wallet status is ${loginOutput.wallet.status}`
        )
    }

    let content = `\n# Wallet for user ${userId}:\n# accountID: ${credentials.accountId}\n# test: ${test}\n`;

    content += `export LIGHTSPARK_JWT_${userId}="${token}"\n`;
    // process.env[`LIGHTSPARK_JWT_${userId}`] = token;
    if (serializedKeypair) {
        content += `export LIGHTSPARK_WALLET_PRIV_KEY_${userId}="${serializedKeypair?.privateKey}"\n`;
        content += `export LIGHTSPARK_WALLET_PUB_KEY_${userId}="${serializedKeypair?.publicKey}"\n`;

        // process.env[`LIGHTSPARK_WALLET_PRIV_KEY_${userId}`] =
        //     serializedKeypair.privateKey;
        // process.env[`LIGHTSPARK_WALLET_PUB_KEY_${userId}`] =
        //     serializedKeypair.publicKey;

        fs.appendFile(LIGHTSPARK_ENV_PATH, content, () => null);
    }

    console.log(content);

    return {
        userId,

        jwt: token,
        pubKey: serializedKeypair?.publicKey,
        privKey: serializedKeypair?.privateKey,
    }
};

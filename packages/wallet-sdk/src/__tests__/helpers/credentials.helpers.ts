import { type CredentialsFromEnv } from '../types/index.js'

const DEFAULT_BASE_URL = 'api.lightspark.com'

export const getCredentialsFromEnvOrThrow = (
    walletEnvSuffix = ''
): CredentialsFromEnv => {
    console.log(process.env)
    console.log(process.env.LIGHTSPARK_ACCOUNT_ID)

    const accountId = process.env[`LIGHTSPARK_ACCOUNT_ID`]
    const jwtSigningPrivateKey = process.env[`LIGHTSPARK_JWT_PRIV_KEY`]
    const jwt = process.env[`LIGHTSPARK_JWT${walletEnvSuffix}`] ?? ''
    const pubKey = process.env[`LIGHTSPARK_WALLET_PUB_KEY${walletEnvSuffix}`]
    const privKey = process.env[`LIGHTSPARK_WALLET_PRIV_KEY${walletEnvSuffix}`]
    const baseUrl =
        process.env[`LIGHTSPARK_EXAMPLE_BASE_URL`] || DEFAULT_BASE_URL

    if (!accountId || !jwtSigningPrivateKey) {
        throw new Error(
            `Missing test credentials. Please set LIGHTSPARK_ACCOUNT_ID and LIGHTSPARK_JWT_PRIV_KEY.`
        )
    }
    return {
        accountId,
        jwt,
        pubKey,
        privKey,
        baseUrl,
        jwtSigningPrivateKey,
    }
}

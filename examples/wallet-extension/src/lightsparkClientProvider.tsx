import { LightsparkWalletClient } from '@lightspark/js-sdk';
import { AccountTokenAuthProvider } from '@lightspark/js-sdk/auth/AccountTokenAuthProvider';
import AccountStorage from './background/AccountStorage';

let instance: LightsparkWalletClient

const TEST_ACCOUNT = {
  tokenId: '0185c15936bf4f89000019ac0f816213',
  token: 'pvKTJfP-DFz66U8ofen9Z2my6nt7ImcpS3rCgW6Ohbs',
};
const TEST_WALLET_ID = 'LightsparkNode:0185c269-8aa3-f96b-0000-0ae100b58599';

export const getLightsparkClient = async (accountStorage: AccountStorage) => {
  if (!instance) {
    // TODO: Remove the test account usage once the account onboarding is ready.
    const account = await accountStorage.getAccountCredentials() ?? TEST_ACCOUNT
    console.log('Using account', JSON.stringify(account));
    debugger;
    instance = new LightsparkWalletClient(new AccountTokenAuthProvider(account.tokenId, account.token), TEST_WALLET_ID);
  }
  return instance;
};

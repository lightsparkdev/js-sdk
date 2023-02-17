import { LightsparkWalletClient } from "@lightspark/js-sdk";
import {AccountTokenAuthProvider} from "@lightspark/js-sdk/auth";
import AccountStorage from "./auth/AccountStorage";

let instance: LightsparkWalletClient;

export const getLightsparkClient = async (accountStorage: AccountStorage) => {
  if (!instance) {
    // TODO: Remove the test account usage once the account onboarding is ready.
    const account = await accountStorage.getAccountCredentials();
    const authProvider =
      (account === null || Date.now() > account.expiresAt)
        ? undefined
        : new AccountTokenAuthProvider(account.clientId, account.clientSecret);
    instance = new LightsparkWalletClient(
      authProvider,
      account?.viewerWalletId
    );
    if (account && authProvider) {
      await instance.loadWalletKey(account.viewerSigningKey);
    }
  }
  return instance;
};

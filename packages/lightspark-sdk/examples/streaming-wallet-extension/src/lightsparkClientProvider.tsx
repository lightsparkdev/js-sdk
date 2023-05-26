import { KeyOrAlias } from "@lightsparkdev/core";
import {
  AccountTokenAuthProvider,
  LightsparkClient,
} from "@lightsparkdev/lightspark-sdk";
import AccountStorage from "./auth/AccountStorage";

let instance: LightsparkClient;

export const getWalletClient = async (accountStorage: AccountStorage) => {
  if (!instance) {
    // TODO: Remove the test account usage once the account onboarding is ready.
    const account = await accountStorage.getAccountCredentials();
    const authProvider =
      account === null || Date.now() > account.expiresAt
        ? undefined
        : new AccountTokenAuthProvider(account.clientId, account.clientSecret);
    instance = new LightsparkClient(authProvider);
    if (account && authProvider) {
      await instance.loadNodeKey(
        account.viewerWalletId,
        KeyOrAlias.key(account.viewerSigningKey)
      );
    }
  }
  return instance;
};

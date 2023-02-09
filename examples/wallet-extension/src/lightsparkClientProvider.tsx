import { LightsparkWalletClient } from "@lightspark/js-sdk";
import { AccountTokenAuthProvider } from "@lightspark/js-sdk/auth/AccountTokenAuthProvider";
import AccountStorage from "./background/AccountStorage";

let instance: LightsparkWalletClient;

export const getLightsparkClient = async (accountStorage: AccountStorage) => {
  if (!instance) {
    // TODO: Remove the test account usage once the account onboarding is ready.
    const account = await accountStorage.getAccountCredentials();
    const authProvider =
      account === null
        ? undefined
        : new AccountTokenAuthProvider(account.tokenId, account.token);
    instance = new LightsparkWalletClient(
      authProvider,
      account?.viewerWalletNodeId
    );
  }
  return instance;
};

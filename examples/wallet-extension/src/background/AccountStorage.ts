import autoBind from "auto-bind";

export interface AccountCredentials {
  tokenId: string;
  token: string;
  viewerWalletNodeId: string;
}

export default class AccountStorage {
  constructor() {
    autoBind(this);
  }

  saveAccountCredentials(credentials: AccountCredentials): Promise<void> {
    return chrome.storage.local.set(credentials);
  }

  async getAccountCredentials(): Promise<AccountCredentials | null> {
    const savedCreds = await chrome.storage.local.get([
      "tokenId",
      "token",
      "viewerWalletNodeId",
    ]);
    if (
      !savedCreds.tokenId ||
      !savedCreds.tokenSecret ||
      !savedCreds.viewerWalletNodeId
    ) {
      return null;
    }
    return savedCreds as AccountCredentials;
  }
}

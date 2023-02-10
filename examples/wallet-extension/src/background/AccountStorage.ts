import autoBind from "auto-bind";

export interface AccountCredentials {
  tokenId: string;
  token: string;
  viewerWalletId: string;
}

export default class AccountStorage {
  constructor() {
    autoBind(this);
  }

  saveAccountCredentials(credentials: AccountCredentials): Promise<void> {
    return chrome.storage.local.set({ credentials });
  }

  async getAccountCredentials(): Promise<AccountCredentials | null> {
    const savedCreds = (await chrome.storage.local.get("credentials"))
      ?.credentials;
    if (
      !savedCreds ||
      !savedCreds.tokenId ||
      !savedCreds.token ||
      !savedCreds.viewerWalletId
    ) {
      return null;
    }
    return savedCreds as AccountCredentials;
  }
}

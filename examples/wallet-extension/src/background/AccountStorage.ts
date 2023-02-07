export interface AccountCredentials {
  tokenId: string;
  token: string;
}

export default class AccountStorage {
  saveAccountCredentials(credentials: AccountCredentials): Promise<void> {
    return chrome.storage.local.set(credentials);
  }

  async getAccountCredentials(): Promise<AccountCredentials | null> {
    const savedCreds = await chrome.storage.local.get([
      "tokenId",
      "token",
    ]);
    if (!savedCreds.tokenId || !savedCreds.tokenSecret) {
      return null;
    }
    return savedCreds as AccountCredentials;
  }
}

import autoBind from "auto-bind";
import StreamingDemoAccountCredentials from "./StreamingDemoCredentials";

export default class AccountStorage {
  constructor() {
    autoBind(this);
  }

  saveAccountCredentials(
    credentials: StreamingDemoAccountCredentials
  ): Promise<void> {
    return chrome.storage.local.set({ credentials });
  }

  async getAccountCredentials(): Promise<StreamingDemoAccountCredentials | null> {
    const savedCreds = (await chrome.storage.local.get("credentials"))
      ?.credentials;
    if (
      !savedCreds ||
      !savedCreds.clientId ||
      !savedCreds.clientSecret ||
      !savedCreds.viewerWalletId
    ) {
      return null;
    }
    return savedCreds as StreamingDemoAccountCredentials;
  }
}

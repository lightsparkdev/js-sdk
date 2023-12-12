import {
  type AccessTokenInfo,
  type AccessTokenStorage,
} from "@lightsparkdev/wallet-sdk";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "lightspark-access-token";

function isParsedJwtTokenInfo(value: unknown): value is {
  accessToken: string;
  validUntil: string;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "accessToken" in value &&
    typeof value.accessToken === "string" &&
    "validUntil" in value &&
    typeof value.validUntil === "string"
  );
}

export default class EncryptedLocalTokenStorage implements AccessTokenStorage {
  async getCurrent(): Promise<AccessTokenInfo | null> {
    const tokenInfo = await SecureStore.getItemAsync(STORAGE_KEY);
    if (tokenInfo === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(tokenInfo);

    if (isParsedJwtTokenInfo(parsed)) {
      return {
        accessToken: parsed.accessToken,
        validUntil: new Date(parsed.validUntil),
      };
    }

    return null;
  }

  async replace(tokenInfo: AccessTokenInfo): Promise<void> {
    await SecureStore.setItemAsync(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: tokenInfo.accessToken,
        validUntil: tokenInfo.validUntil.toISOString(),
      }),
    );
  }

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  }
}

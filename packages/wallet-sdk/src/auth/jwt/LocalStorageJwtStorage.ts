// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import AsyncStorageModule, {
  type AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";
import type JwtStorage from "./JwtStorage.js";
import type JwtTokenInfo from "./JwtTokenInfo.js";

const STORAGE_KEY = "lightspark-jwt";

/* Async storage module types don't resolve correctly for some reason: */
const AsyncStorage = AsyncStorageModule as unknown as AsyncStorageStatic;

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

/**
 * Stores JWT token info in local storage or the appropriate equivalent for
 * react native. See here for more platform-specific storage location:
 * https://react-native-async-storage.github.io/async-storage/docs/advanced/where_data_stored
 */
class LocalStorageJwtStorage implements JwtStorage {
  async getCurrent(): Promise<JwtTokenInfo | null> {
    const tokenInfo = await AsyncStorage.getItem(STORAGE_KEY);
    if (tokenInfo === null) {
      return null;
    }

    const parsed = JSON.parse(tokenInfo);

    if (isParsedJwtTokenInfo(parsed)) {
      return {
        accessToken: parsed.accessToken,
        validUntil: new Date(parsed.validUntil),
      };
    }

    return null;
  }

  async replace(tokenInfo: JwtTokenInfo): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: tokenInfo.accessToken,
        validUntil: tokenInfo.validUntil.toISOString(),
      }),
    );
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

export default LocalStorageJwtStorage;

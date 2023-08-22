// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import AsyncStorage from "@react-native-async-storage/async-storage";
import type JwtStorage from "./JwtStorage.js";
import type JwtTokenInfo from "./JwtTokenInfo.js";

const STORAGE_KEY = "lightspark-jwt";

/**
 * Stores JWT token info in local storage or the appropriate equivalent for react native.
 * See here for more platform-specific storage location:
 * https://react-native-async-storage.github.io/async-storage/docs/advanced/where_data_stored
 */
class LocalStorageJwtStorage implements JwtStorage {
  async getCurrent(): Promise<JwtTokenInfo | null> {
    const tokenInfo = await (AsyncStorage as any).getItem(STORAGE_KEY);
    if (tokenInfo === null) {
      return null;
    }

    const parsed = JSON.parse(tokenInfo);
    return {
      accessToken: parsed.accessToken,
      validUntil: new Date(parsed.validUntil),
    };
  }

  async replace(tokenInfo: JwtTokenInfo): Promise<void> {
    await (AsyncStorage as any).setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: tokenInfo.accessToken,
        validUntil: tokenInfo.validUntil.toISOString(),
      }),
    );
  }

  async clear(): Promise<void> {
    await (AsyncStorage as any).removeItem(STORAGE_KEY);
  }
}

export default LocalStorageJwtStorage;

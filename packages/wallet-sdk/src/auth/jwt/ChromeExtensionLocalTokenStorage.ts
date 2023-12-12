// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type JwtStorage from "./JwtStorage.js";
import type JwtTokenInfo from "./JwtTokenInfo.js";
import { isParsedJwtTokenInfo } from "./JwtTokenInfo.js";

const STORAGE_KEY = "lightspark-jwt";

/**
 * Stores JWT access token info in local storage for use in Chrome Extensions
 * (chrome.storage.local).
 *
 * For web: This should not be used in web. Instead, you should use InMemoryJwtStorage
 * and silently re-auth the user when the page is refreshed.
 * For React Native: This should not be used in React Native. Instead, you should use
 * EncryptedLocalTokenStorage from the @lightsparkdev/react-native package.
 */
class ChromeExtensionLocalTokenStorage implements JwtStorage {
  async getCurrent(): Promise<JwtTokenInfo | null> {
    if (!chrome || !chrome.storage || !chrome.storage.local) {
      throw new Error(
        "Chrome extension local storage is not available in this environment.",
      );
    }
    const tokenInfo = await chrome.storage.local.get([STORAGE_KEY]);
    if (tokenInfo === null) {
      return null;
    }

    if (isParsedJwtTokenInfo(tokenInfo)) {
      return {
        accessToken: tokenInfo.accessToken,
        validUntil: new Date(tokenInfo.validUntil),
      };
    }

    return null;
  }

  async replace(tokenInfo: JwtTokenInfo): Promise<void> {
    await chrome.storage.local.set({
      STORAGE_KEY: {
        accessToken: tokenInfo.accessToken,
        validUntil: tokenInfo.validUntil.toISOString(),
      },
    });
  }

  async clear(): Promise<void> {
    await chrome.storage.local.remove(STORAGE_KEY);
  }
}

export default ChromeExtensionLocalTokenStorage;

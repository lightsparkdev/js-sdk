// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type AccessTokenInfo from "./AccessTokenInfo.js";
import type AccessTokenStorage from "./AccessTokenStorage.js";

/**
 * In-memory implementation of {@link AccessTokenStorage}.
 */
class InMemoryTokenStorage implements AccessTokenStorage {
  private tokenInfo: AccessTokenInfo | null = null;

  getCurrent(): Promise<AccessTokenInfo | null> {
    return Promise.resolve(this.tokenInfo);
  }

  replace(tokenInfo: AccessTokenInfo): Promise<void> {
    this.tokenInfo = tokenInfo;
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.tokenInfo = null;
    return Promise.resolve();
  }
}

export default InMemoryTokenStorage;

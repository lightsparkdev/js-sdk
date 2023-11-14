// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type JwtStorage from "./JwtStorage.js";
import type JwtTokenInfo from "./JwtTokenInfo.js";

/**
 * In-memory implementation of {@link JwtStorage}.
 */
class InMemoryJwtStorage implements JwtStorage {
  private tokenInfo: JwtTokenInfo | null = null;

  getCurrent(): Promise<JwtTokenInfo | null> {
    return Promise.resolve(this.tokenInfo);
  }

  replace(tokenInfo: JwtTokenInfo): Promise<void> {
    this.tokenInfo = tokenInfo;
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.tokenInfo = null;
    return Promise.resolve();
  }
}

export default InMemoryJwtStorage;

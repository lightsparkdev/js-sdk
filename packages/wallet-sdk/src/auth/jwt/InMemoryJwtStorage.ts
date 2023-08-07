// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type JwtStorage from "./JwtStorage.js";
import type JwtTokenInfo from "./JwtTokenInfo.js";

/**
 * In-memory implementation of {@link JwtStorage}.
 */
class InMemoryJwtStorage implements JwtStorage {
  private tokenInfo: JwtTokenInfo | null = null;

  async getCurrent(): Promise<JwtTokenInfo | null> {
    return this.tokenInfo;
  }

  async replace(tokenInfo: JwtTokenInfo): Promise<void> {
    this.tokenInfo = tokenInfo;
  }

  async clear(): Promise<void> {
    this.tokenInfo = null;
  }
}

export default InMemoryJwtStorage;

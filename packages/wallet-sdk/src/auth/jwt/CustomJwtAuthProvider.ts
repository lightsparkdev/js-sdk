// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type { AuthProvider } from "@lightsparkdev/core";
import type JwtStorage from "./JwtStorage.js";
import type JwtTokenInfo from "./JwtTokenInfo.js";

/**
 * A custom [AuthProvider] that uses a JWT token to authenticate requests.
 *
 * Should generally not be used directly by clients, but rather through the [loginWithJwt] method of a
 * [LightsparkWalletClient].
 *
 * @param tokenStorage A [JwtStorage] implementation that stores or retrieves the current JWT token info.
 */
class CustomJwtAuthProvider implements AuthProvider {
  constructor(private jwtStorage: JwtStorage) {}

  public async setTokenInfo(tokenInfo: JwtTokenInfo): Promise<void> {
    await this.jwtStorage.replace(tokenInfo);
  }

  public async logout(): Promise<void> {
    await this.jwtStorage.clear();
  }

  public async addAuthHeaders(headers: Record<string, unknown>): Promise<any> {
    const tokenInfo = await this.jwtStorage.getCurrent();
    if (!tokenInfo) {
      return headers;
    }
    return Object.assign({}, headers, {
      authorization: `Bearer ${tokenInfo.accessToken}`,
    });
  }

  public async isAuthorized(): Promise<boolean> {
    const tokenInfo = await this.jwtStorage.getCurrent();
    if (!tokenInfo) {
      return false;
    }
    return tokenInfo.validUntil > new Date();
  }

  public async addWsConnectionParams(params: Record<string, unknown>) {
    const tokenInfo = await this.jwtStorage.getCurrent();
    if (!tokenInfo) {
      return params;
    }
    return Object.assign({}, params, {
      access_token: tokenInfo.accessToken,
    });
  }
}

export default CustomJwtAuthProvider;

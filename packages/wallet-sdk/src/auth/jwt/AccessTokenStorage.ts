// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type AccessTokenInfo from "./AccessTokenInfo.js";

/**
 * Interface for storing and retrieving JWT token info.
 */
interface AccessTokenStorage {
  getCurrent(): Promise<AccessTokenInfo | null>;
  replace(tokenInfo: AccessTokenInfo): Promise<void>;
  clear(): Promise<void>;
}

export default AccessTokenStorage;

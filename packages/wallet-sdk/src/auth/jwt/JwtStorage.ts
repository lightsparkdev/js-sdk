// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import JwtTokenInfo from "./JwtTokenInfo.js";

/**
 * Interface for storing and retrieving JWT token info.
 */
interface JwtStorage {
  getCurrent(): Promise<JwtTokenInfo | null>;
  replace(tokenInfo: JwtTokenInfo): Promise<void>;
  clear(): Promise<void>;
}

export default JwtStorage;

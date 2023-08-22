// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

export type Headers = Record<string, string>;
export type WsConnectionParams = Record<string, unknown>;

export default interface AuthProvider {
  addAuthHeaders(headers: Headers): Promise<Headers>;
  isAuthorized(): Promise<boolean>;
  addWsConnectionParams(
    params: WsConnectionParams,
  ): Promise<WsConnectionParams>;
}

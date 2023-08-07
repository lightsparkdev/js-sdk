// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type AuthProvider from "./AuthProvider.js";
import { type Headers, type WsConnectionParams } from "./AuthProvider.js";

export default class StubAuthProvider implements AuthProvider {
  async addAuthHeaders(headers: Headers) {
    return headers;
  }
  async isAuthorized(): Promise<boolean> {
    return false;
  }

  async addWsConnectionParams(params: WsConnectionParams) {
    return params;
  }
}

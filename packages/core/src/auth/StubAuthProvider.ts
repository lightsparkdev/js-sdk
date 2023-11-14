// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type AuthProvider from "./AuthProvider.js";
import { type Headers, type WsConnectionParams } from "./AuthProvider.js";

export default class StubAuthProvider implements AuthProvider {
  addAuthHeaders(headers: Headers) {
    return Promise.resolve(headers);
  }
  isAuthorized(): Promise<boolean> {
    return Promise.resolve(false);
  }
  addWsConnectionParams(params: WsConnectionParams) {
    return Promise.resolve(params);
  }
}

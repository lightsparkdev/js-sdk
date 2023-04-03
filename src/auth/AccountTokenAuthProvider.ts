// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";

import AuthProvider from "./AuthProvider.js";

import { b64encode } from "../utils/base64.js";

class AccountTokenAuthProvider implements AuthProvider {
  private readonly utf8AuthBytes: Uint8Array;

  constructor(
    private readonly apiTokenClientId: string,
    private readonly apiTokenClientSecret: string
  ) {
    this.utf8AuthBytes = new TextEncoder().encode(
      `${apiTokenClientId}:${apiTokenClientSecret}`
    );
    autoBind(this);
  }

  addWsConnectionParams(params: any): any {
    return Object.assign({}, params, {
      client_id: this.apiTokenClientId,
      client_secret: this.apiTokenClientSecret,
    });
  }

  async addAuthHeaders(headers: any): Promise<any> {
    return Object.assign({}, headers, {
      authorization: `Basic ${b64encode(this.utf8AuthBytes)}`,
    });
  }

  async isAuthorized(): Promise<boolean> {
    return true;
  }
}

export default AccountTokenAuthProvider;

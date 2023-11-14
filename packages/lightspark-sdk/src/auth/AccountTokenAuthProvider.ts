// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type { AuthProvider } from "@lightsparkdev/core";
import { b64encode } from "@lightsparkdev/core";
import autoBind from "auto-bind";

class AccountTokenAuthProvider implements AuthProvider {
  private readonly utf8AuthBytes: Uint8Array;

  constructor(
    private readonly apiTokenClientId: string,
    private readonly apiTokenClientSecret: string,
  ) {
    this.utf8AuthBytes = new TextEncoder().encode(
      `${apiTokenClientId}:${apiTokenClientSecret}`,
    );
    autoBind(this);
  }

  addWsConnectionParams(
    params: Record<string, string>,
  ): Promise<Record<string, string>> {
    return Promise.resolve(
      Object.assign({}, params, {
        client_id: this.apiTokenClientId,
        client_secret: this.apiTokenClientSecret,
      }),
    );
  }

  addAuthHeaders(
    headers: Record<string, string>,
  ): Promise<Record<string, string>> {
    return Promise.resolve(
      Object.assign({}, headers, {
        authorization: `Basic ${b64encode(this.utf8AuthBytes)}`,
      }),
    );
  }

  isAuthorized(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

export default AccountTokenAuthProvider;

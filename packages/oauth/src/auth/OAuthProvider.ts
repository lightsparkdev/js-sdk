import autoBind from "auto-bind";

import type { AuthProvider } from "@lightsparkdev/core";
import type OAuthStateHelper from "./OAuthStateHelper.js";

class OAuthProvider implements AuthProvider {
  constructor(private readonly oauthHelper: OAuthStateHelper) {
    autoBind(this);
  }

  async addWsConnectionParams(
    params: Record<string, string>,
  ): Promise<Record<string, string>> {
    try {
      const accessToken = await this.oauthHelper.getFreshAccessToken();
      return Object.assign({}, params, {
        authorization: `Bearer ${accessToken}`,
      });
    } catch (e) {
      console.log("Error getting access token. Trying no auth.", e);
      return params;
    }
  }

  async addAuthHeaders(
    headers: Record<string, string>,
  ): Promise<Record<string, string>> {
    try {
      const accessToken = await this.oauthHelper.getFreshAccessToken();
      return Object.assign({}, headers, {
        authorization: `Bearer ${accessToken}`,
      });
    } catch (e) {
      console.log("Error getting access token. Trying no auth.", e);
      return headers;
    }
  }

  isAuthorized(): Promise<boolean> {
    return Promise.resolve(this.oauthHelper.isAuthorized());
  }
}

export default OAuthProvider;

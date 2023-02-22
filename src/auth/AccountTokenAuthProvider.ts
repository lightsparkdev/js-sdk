import autoBind from "auto-bind";
import { b64encode } from "../utils/base64.js";
import AuthProvider from "./AuthProvider.js";

class AccountTokenAuthProvider implements AuthProvider {
  private readonly utf8AuthBytes: Uint8Array;

  constructor(
    private readonly tokenId: string,
    private readonly token: string
  ) {
    this.utf8AuthBytes = new TextEncoder().encode(`${tokenId}:${token}`);
    autoBind(this);
  }

  addWsConnectionParams(params: any): any {
    return Object.assign({}, params, {
      client_id: this.tokenId,
      client_secret: this.token,
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

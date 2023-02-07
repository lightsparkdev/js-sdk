import autoBind from "auto-bind";
import { b64encode } from "../utils/base64";
import AuthProvider from "./AuthProvider";

export class AccountTokenAuthProvider implements AuthProvider {
  private readonly utf8AuthBytes: Uint8Array;

  constructor(tokenId: string, token: string) {
    this.utf8AuthBytes = new TextEncoder().encode(`${tokenId}:${token}`);
    autoBind(this);
  }

  async addAuthHeaders(headers: any): Promise<any> {
    return Object.assign({}, headers, {
      authorization: `Basic ${b64encode(this.utf8AuthBytes)}`,
    });
  }
}

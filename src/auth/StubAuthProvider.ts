import AuthProvider from "./AuthProvider.js";

export default class StubAuthProvider implements AuthProvider {
  async addAuthHeaders(headers: any): Promise<any> {
    return headers;
  }
  async isAuthorized(): Promise<boolean> {
    return false;
  }

  addWsConnectionParams(params: any): any {
    return params;
  }
}

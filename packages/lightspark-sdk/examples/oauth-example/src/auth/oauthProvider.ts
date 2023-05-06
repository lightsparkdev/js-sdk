import { OAuthStateHelper } from "@lightsparkdev/oauth";

const CLIENT_ID = "0186ffea-9d6e-7777-0000-8c584f503545";
const CLIENT_SECRET = "JrsBdKnPqLOPomGSXrGKFmS1YWuL8C77nxV1o8M5yEf";
const REDIRECT_URI =
  window.location.href.substring(0, window.location.href.lastIndexOf("/")) +
  "/oauth";

class OAuthProvider {
  readonly oauthHelper = new OAuthStateHelper(
    CLIENT_ID,
    CLIENT_SECRET,
    "dev.dev.sparkinfra.net",
    "api.dev.dev.sparkinfra.net"
  );

  async checkAuth() {
    await this.oauthHelper.checkForAuthorizationResponse();
    return this.oauthHelper.isAuthorized();
  }

  signin(callback: VoidFunction) {
    this.oauthHelper.launchOAuthFlow("all", REDIRECT_URI);
  }

  async signout() {
    await this.oauthHelper.signOut();
  }

  isAuthorized() {
    return this.oauthHelper.isAuthorized();
  }
}

export { OAuthProvider };

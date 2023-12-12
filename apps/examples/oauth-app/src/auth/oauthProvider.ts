import { OAuthStateHelper } from "@lightsparkdev/oauth";

const REDIRECT_URI =
  window.location.href.substring(0, window.location.href.lastIndexOf("/")) +
  "/oauth";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID as string;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET as string;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error(
    "Missing required environment variables. Please set VITE_CLIENT_ID and VITE_CLIENT_SECRET in .env.local."
  );
}

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

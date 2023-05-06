import {
  apiDomainForEnvironment,
  LightsparkAuthException,
  ServerEnvironment,
} from "@lightsparkdev/core";
import {
  AuthorizationNotifier,
  AuthorizationRequest,
  AuthorizationResponse,
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
  GRANT_TYPE_AUTHORIZATION_CODE,
  GRANT_TYPE_REFRESH_TOKEN,
  RedirectRequestHandler,
  RevokeTokenRequest,
  StringMap,
  TokenRequest,
  TokenResponse,
} from "@openid/appauth";
import OAuthTokenRequestHandler from "./OAuthTokenRequestHandler.js";

/**
 * A helper class for managing the OAuth state of the Lightspark client.
 *
 * It's used to launch and handle the OAuth flow, and to store the resulting
 * tokens.
 *
 * Example usage:
 * =====================
 *
 * In your login page:
 *
 * ```ts
 * const oauthStateHelper = new OAuthStateHelper(
 *  "my-client-id",
 *  "my-client-secret",
 * );
 *
 * // When the user clicks the login button, launch the OAuth flow.
 * this.oauthHelper.launchOAuthFlow("all", REDIRECT_URI);
 * ```
 *
 * In your redirect page:
 * ```ts
 * const oauthStateHelper = new OAuthStateHelper(
 *   "my-client-id",
 *   "my-client-secret",
 * );
 *
 * // When the page loads, handle the OAuth response.
 * oauthStateHelper.checkForAuthorizationResponse();
 *
 * // Then you can use the tokens by creating a LightsparkClient:
 * const client = new LightsparkClient(
 *  new OAuthProvider(oauthStateHelper)
 * );
 * ```
 */
class OAuthStateHelper {
  private readonly notifier: AuthorizationNotifier;
  private readonly authorizationHandler: RedirectRequestHandler;
  private readonly tokenHandler: BaseTokenRequestHandler;

  private configuration: AuthorizationServiceConfiguration;
  private authRequest: AuthorizationRequest | undefined;
  private authResponse: AuthorizationResponse | undefined;
  private code: string | undefined;
  private tokenResponse: TokenResponse | undefined;
  private redirectUri: string | undefined;
  private pendingTokenRequest: Promise<TokenResponse> | undefined;

  constructor(
    private readonly clientId: string,
    clientSecret: string,
    baseAuthUrl: string = authDomainForEnvironment(
      ServerEnvironment.PRODUCTION
    ),
    baseTokenUrl: string = apiDomainForEnvironment(ServerEnvironment.PRODUCTION)
  ) {
    this.configuration = new AuthorizationServiceConfiguration({
      authorization_endpoint: `https://${baseAuthUrl}/oauth/authorize`,
      token_endpoint: `https://${baseTokenUrl}/oauth/token`,
      revocation_endpoint: `https://${baseTokenUrl}/oauth/revoke`,
    });
    this.notifier = new AuthorizationNotifier();
    this.authorizationHandler = new RedirectRequestHandler();
    this.tokenHandler = new OAuthTokenRequestHandler(clientId, clientSecret);
    this.authorizationHandler.setAuthorizationNotifier(this.notifier);
    this.notifier.setAuthorizationListener((request, response, error) => {
      // TODO: Consider a way to cache the auth state or allow clients to do so.
      console.log("Authorization request complete ", request, response, error);
      if (response) {
        this.authRequest = request;
        this.authResponse = response;
        this.code = response.code;
        this.redirectUri = request.redirectUri;
        console.log(`Authorization Code ${response.code}`);
      }
    });
  }

  /**
   * Starts the login flow by sending the user to the Lightspark login page.
   *
   * @param scope Scopes to request from the user.
   * @param redirectUri The url to redirect to after the user has logged in.
   */
  public launchOAuthFlow(scope: string, redirectUri: string) {
    this.redirectUri = redirectUri;
    const request = new AuthorizationRequest(
      {
        client_id: this.clientId,
        redirect_uri: redirectUri,
        scope: scope,
        response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
        state: undefined,
      },
      undefined,
      true
    );

    this.authorizationHandler.performAuthorizationRequest(
      this.configuration,
      request
    );
  }

  makeTokenRequest() {
    if (this.pendingTokenRequest) {
      return this.pendingTokenRequest;
    }
    this.pendingTokenRequest = new Promise<TokenResponse>((resolve, reject) => {
      let request: TokenRequest | null = null;
      if (!this.redirectUri) {
        this.pendingTokenRequest = undefined;
        throw new LightsparkAuthException(
          "Redirect URI must be set before making a token request."
        );
      }
      if (this.tokenResponse) {
        request = new TokenRequest({
          client_id: this.clientId,
          redirect_uri: this.redirectUri,
          grant_type: GRANT_TYPE_REFRESH_TOKEN,
          code: undefined,
          refresh_token: this.tokenResponse.refreshToken,
          extras: undefined,
        });
      } else if (this.code) {
        let extras: StringMap | undefined = undefined;
        if (this.authRequest && this.authRequest.internal) {
          extras = {};
          extras["code_verifier"] = this.authRequest.internal["code_verifier"];
        }

        request = new TokenRequest({
          client_id: this.clientId,
          redirect_uri: this.redirectUri,
          grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
          code: this.code,
          refresh_token: undefined,
          extras: extras,
        });
      }

      if (!request) {
        this.pendingTokenRequest = undefined;
        throw new LightsparkAuthException("No token request could be made.");
      }
      this.tokenHandler
        .performTokenRequest(this.configuration, request)
        .then((response) => {
          let isFirstRequest = false;
          if (this.tokenResponse) {
            this.tokenResponse.accessToken = response.accessToken;
            this.tokenResponse.issuedAt = response.issuedAt;
            this.tokenResponse.expiresIn = response.expiresIn;
            this.tokenResponse.tokenType = response.tokenType;
            this.tokenResponse.scope = response.scope;
          } else {
            isFirstRequest = true;
            this.tokenResponse = response;
          }

          // unset code, so we can do refresh token exchanges subsequently.
          this.code = undefined;
          if (isFirstRequest) {
            console.log(`Obtained a refresh token ${response.refreshToken}`);
          } else {
            console.log(`Obtained an access token ${response.accessToken}.`);
          }
          this.pendingTokenRequest = undefined;
          resolve(response);
        })
        .catch((error) => {
          console.log(`Token request failed.`, error);
          this.pendingTokenRequest = undefined;
          reject(error);
        });
    });
    return this.pendingTokenRequest;
  }

  public async signOut() {
    await this.tokenHandler.performRevokeTokenRequest(
      this.configuration,
      new RevokeTokenRequest({
        token: this.tokenResponse?.refreshToken ?? "",
        client_id: this.clientId,
      })
    );
    this.authRequest = undefined;
    this.authResponse = undefined;
    this.code = undefined;
    this.tokenResponse = undefined;
  }

  /**
   * Do some action with fresh valid access tokens.
   *
   * @param action The function to run with the access token.
   * @throws LightsparkAuthException if there is no valid authorization.
   */
  public doWithFreshAccessToken(
    action: (accessToken: string, idToken: string | undefined) => void
  ) {
    if (this.tokenResponse && !this.needsTokenRefresh()) {
      action(this.tokenResponse.accessToken, this.tokenResponse.idToken);
      return Promise.resolve();
    }

    if (!this.authResponse) {
      throw new LightsparkAuthException(
        "No valid authorization. Please login first."
      );
    }

    return this.makeTokenRequest().then((response) => {
      action(response.accessToken, response.idToken);
    });
  }

  /**
   * @returns A promise that resolves to a fresh access token.
   * @throws LightsparkAuthException if there is no valid authorization.
   */
  public async getFreshAccessToken() {
    if (this.tokenResponse && !this.needsTokenRefresh()) {
      return this.tokenResponse.accessToken;
    }

    if (!this.authResponse) {
      throw new LightsparkAuthException(
        "No valid authorization. Please login first."
      );
    }

    const newResponse = await this.makeTokenRequest();
    return newResponse.accessToken;
  }

  needsTokenRefresh(): boolean {
    if (!this.tokenResponse) {
      return true;
    }

    if (!this.tokenResponse.expiresIn) {
      return false;
    }

    const now = new Date().getTime();
    const expiresAt =
      this.tokenResponse.issuedAt + this.tokenResponse.expiresIn;
    // 60-second buffer
    const refreshAt = (expiresAt - 60) * 1000;
    return now >= refreshAt;
  }

  /**
   * Completes the authorization flow once the user has been redirected back to the app
   * if the current url contains an authorization response.
   */
  public checkForAuthorizationResponse() {
    return this.authorizationHandler.completeAuthorizationRequestIfPossible();
  }

  public isAuthorized(): boolean {
    return !!this.authResponse;
  }
}

const authDomainForEnvironment = (environment: ServerEnvironment) => {
  switch (environment) {
    case ServerEnvironment.PRODUCTION:
      return "app.lightspark.com";
    case ServerEnvironment.DEV:
      return "dev.dev.sparkinfra.net";
  }
};

export default OAuthStateHelper;

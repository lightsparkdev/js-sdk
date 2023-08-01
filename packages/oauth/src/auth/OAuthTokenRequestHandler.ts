import { b64encode } from "@lightsparkdev/core";
import {
  AppAuthError,
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
  BasicQueryStringUtils,
  FetchRequestor,
  QueryStringUtils,
  Requestor,
  TokenError,
  TokenErrorJson,
  TokenRequest,
  TokenResponse,
  TokenResponseJson,
} from "@openid/appauth";

class OAuthTokenRequestHandler extends BaseTokenRequestHandler {
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    public readonly requestor: Requestor = new FetchRequestor(),
    public readonly utils: QueryStringUtils = new BasicQueryStringUtils()
  ) {
    super(requestor, utils);
  }

  private isValidTokenResponse(
    response: TokenResponseJson | TokenErrorJson
  ): response is TokenResponseJson {
    return (response as TokenErrorJson).error === undefined;
  }

  public async performTokenRequest(
    configuration: AuthorizationServiceConfiguration,
    request: TokenRequest
  ): Promise<TokenResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const encodedClientId = encodeURIComponent(this.clientId);
    const encodedClientSecret = encodeURIComponent(this.clientSecret);
    let TextEncoderImpl = TextEncoder;
    if (typeof TextEncoder === "undefined") {
      TextEncoderImpl = (await import("text-encoding")).TextEncoder;
    }
    const credentialsBytes = new TextEncoderImpl().encode(
      encodedClientId + ":" + encodedClientSecret
    );
    headers["Authorization"] = `Basic ${b64encode(credentialsBytes)}`;

    const tokenResponse = this.requestor.xhr<
      TokenResponseJson | TokenErrorJson
    >({
      url: configuration.tokenEndpoint,
      method: "POST",
      dataType: "json", // adding implicit dataType
      headers: headers,
      data: this.utils.stringify(request.toStringMap()),
    });

    return tokenResponse.then((response) => {
      if (this.isValidTokenResponse(response)) {
        return new TokenResponse(response);
      } else {
        return Promise.reject<TokenResponse>(
          new AppAuthError(response.error, new TokenError(response))
        );
      }
    });
  }
}

export default OAuthTokenRequestHandler;

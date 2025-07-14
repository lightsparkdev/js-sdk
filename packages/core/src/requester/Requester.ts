// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { Client as WsClient } from "graphql-ws";
import { Observable } from "zen-observable-ts";

import type Query from "./Query.js";

import type AuthProvider from "../auth/AuthProvider.js";
import StubAuthProvider from "../auth/StubAuthProvider.js";
import type { CryptoInterface } from "../crypto/crypto.js";
import { DefaultCrypto, LightsparkSigningException } from "../crypto/crypto.js";
import type NodeKeyCache from "../crypto/NodeKeyCache.js";
import type { SigningKey } from "../crypto/SigningKey.js";
import LightsparkException from "../LightsparkException.js";
import { logger } from "../Logger.js";
import { b64encode } from "../utils/base64.js";
import { isBare, isNode } from "../utils/environment.js";

const DEFAULT_BASE_URL = "api.lightspark.com";
dayjs.extend(utc);

type BodyData = {
  query: string;
  variables: { [key: string]: unknown };
  operationName: string;
  nonce?: number;
  expires_at?: string;
};

class Requester {
  private wsClient: Promise<WsClient | null>;
  private resolveWsClient: ((value: WsClient | null) => void) | null = null;
  constructor(
    private readonly nodeKeyCache: NodeKeyCache,
    private readonly schemaEndpoint: string,
    private readonly sdkUserAgent: string,
    private readonly authProvider: AuthProvider = new StubAuthProvider(),
    private readonly baseUrl: string = DEFAULT_BASE_URL,
    private readonly cryptoImpl: CryptoInterface = DefaultCrypto,
    private readonly signingKey?: SigningKey,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {
    this.wsClient = new Promise<WsClient | null>((resolve) => {
      this.resolveWsClient = resolve;
    });
    void this.initWsClient(baseUrl, authProvider);
    autoBind(this);
  }

  private async initWsClient(baseUrl: string, authProvider: AuthProvider) {
    if (!this.resolveWsClient) {
      /* If resolveWsClient is null assume already initialized: */
      return this.wsClient;
    }

    if (isBare) {
      /* graphql-ws library is currently not supported in Bare environment, see LIG-7942 */
      return null;
    }

    let websocketImpl;
    if (isNode && typeof WebSocket === "undefined") {
      const wsModule = await import("ws");
      websocketImpl = wsModule.default;
    }
    let websocketProtocol = "wss";
    if (baseUrl.startsWith("http://")) {
      websocketProtocol = "ws";
    }

    const graphqlWsModule = await import("graphql-ws");
    const { createClient } = graphqlWsModule;

    const wsClient = createClient({
      url: `${websocketProtocol}://${this.stripProtocol(this.baseUrl)}/${
        this.schemaEndpoint
      }`,
      connectionParams: () => authProvider.addWsConnectionParams({}),
      webSocketImpl: websocketImpl,
    });

    if (this.resolveWsClient) {
      this.resolveWsClient(wsClient);
      this.resolveWsClient = null;
    }

    return wsClient;
  }

  public async executeQuery<T>(query: Query<T>): Promise<T | null> {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- LIG-3400 */
    const data = await this.makeRawRequest(
      query.queryPayload,
      query.variables || {},
      query.signingNodeId,
      !!query.skipAuth,
    );
    return query.constructObject(data);
  }

  public subscribe<T>(
    queryPayload: string,
    variables: { [key: string]: unknown } = {},
  ) {
    logger.trace(`Requester.subscribe variables`, variables);

    const operationNameRegex = /^\s*(query|mutation|subscription)\s+(\w+)/i;
    const operationMatch = queryPayload.match(operationNameRegex);
    if (!operationMatch || operationMatch.length < 3) {
      throw new LightsparkException("InvalidQuery", "Invalid query payload");
    }
    const operationType = operationMatch[1];
    logger.trace(`Requester.subscribe operationType`, operationType);
    if (operationType == "mutation") {
      throw new LightsparkException(
        "InvalidQuery",
        "Mutation queries should call makeRawRequest instead",
      );
    }
    // Undefined variables need to be null instead.
    for (const key in variables) {
      if (variables[key] === undefined) {
        variables[key] = null;
      }
    }
    const operation = operationMatch[2];
    const bodyData: BodyData = {
      query: queryPayload,
      variables,
      operationName: operation,
    };

    return new Observable<{ data: T }>((observer) => {
      logger.trace(`Requester.subscribe observer`, observer);

      let cleanup: (() => void) | null = null;
      let canceled = false;

      void (async () => {
        try {
          const wsClient = await this.wsClient;

          if (!wsClient) {
            /* graphql-ws library is currently not supported in Bare environment, see LIG-7942 */
            throw new LightsparkException(
              "WebSocketNotInitialized",
              "WebSocket client is not initialized or is not available in the current environment.",
            );
          }

          if (!canceled) {
            cleanup = wsClient.subscribe(bodyData, {
              next: (data) => observer.next(data as { data: T }),
              error: (err) => observer.error(err),
              complete: () => observer.complete(),
            });
          }
        } catch (err) {
          observer.error(err);
        }
      })();

      return () => {
        canceled = true;
        if (cleanup) {
          cleanup();
        }
      };
    });
  }

  public async makeRawRequest(
    queryPayload: string,
    variables: { [key: string]: unknown } = {},
    signingNodeId: string | undefined = undefined,
    skipAuth: boolean = false,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- LIG-3400 */
  ): Promise<any> {
    logger.trace(`Requester.makeRawRequest args`, {
      queryPayload,
      variables,
      signingNodeId,
      skipAuth,
    });

    const operationNameRegex = /^\s*(query|mutation|subscription)\s+(\w+)/i;
    const operationMatch = queryPayload.match(operationNameRegex);
    if (!operationMatch || operationMatch.length < 3) {
      throw new LightsparkException("InvalidQuery", "Invalid query payload");
    }
    const operationType = operationMatch[1];
    if (operationType == "subscription") {
      throw new LightsparkException(
        "InvalidQuery",
        "Subscription queries should call subscribe instead",
      );
    }
    // Undefined variables need to be null instead.
    for (const key in variables) {
      if (variables[key] === undefined) {
        variables[key] = null;
      }
    }
    const operation = operationMatch[2];
    const payload: BodyData = {
      query: queryPayload,
      variables,
      operationName: operation,
    };
    const browserUserAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";
    const sdkUserAgent = this.getSdkUserAgent();
    const baseHeaders = {
      "Content-Type": "application/json",
      "X-Lightspark-SDK": sdkUserAgent,
      "User-Agent": browserUserAgent || sdkUserAgent,
      "X-GraphQL-Operation": operation,
    };
    const headers: { [key: string]: string } = skipAuth
      ? baseHeaders
      : await this.authProvider.addAuthHeaders(baseHeaders);
    let bodyData = await this.addSigningDataIfNeeded(
      payload,
      headers,
      signingNodeId,
    );

    if (bodyData.length > 1024 && typeof CompressionStream != "undefined") {
      bodyData = await compress(bodyData);
      headers["Content-Encoding"] = "deflate";
    }

    let urlWithProtocol = this.baseUrl;
    if (
      !urlWithProtocol.startsWith("https://") &&
      !urlWithProtocol.startsWith("http://")
    ) {
      urlWithProtocol = `https://${urlWithProtocol}`;
    }

    const url = `${urlWithProtocol}/${this.schemaEndpoint}`;

    logger.trace(`Requester.makeRawRequest`, {
      url,
      operationName: operation,
      variables,
      headers,
    });
    const response = await this.fetchImpl(url, {
      method: "POST",
      headers,
      body: bodyData,
    });
    if (!response.ok) {
      throw new LightsparkException(
        "RequestFailed",
        `Request ${operation} failed. ${response.statusText}`,
      );
    }
    const responseJson = (await response.json()) as {
      data: unknown;
      errors: unknown;
    };
    const data = responseJson.data;
    if (!data) {
      let firstErrorName: string | undefined = undefined;
      if (
        Array.isArray(responseJson.errors) &&
        responseJson.errors.length > 0
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const firstError = responseJson.errors[0];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        firstErrorName = firstError["extensions"]?.["error_name"] as
          | string
          | undefined;
      }
      throw new LightsparkException(
        "RequestFailed",
        `Request ${operation} failed. ${JSON.stringify(responseJson.errors)}`,
        { errorName: firstErrorName },
      );
    }
    return data;
  }

  private getSdkUserAgent(): string {
    const platform = isNode ? "NodeJS" : "Browser";
    const platformVersion = isNode ? process.version : "";
    return `${this.sdkUserAgent} ${platform}/${platformVersion}`;
  }

  private stripProtocol(url: string): string {
    return url.replace(/.*?:\/\//g, "");
  }

  private async addSigningDataIfNeeded(
    queryPayload: BodyData,
    headers: { [key: string]: string },
    signingNodeId: string | undefined,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- LIG-3400 */
  ): Promise<Uint8Array> {
    if (!signingNodeId) {
      return new TextEncoder().encode(JSON.stringify(queryPayload));
    }

    const query = queryPayload.query;
    const variables = queryPayload.variables;
    const operationName = queryPayload.operationName;

    const nonce = await this.cryptoImpl.getNonce();
    const expiration = dayjs.utc().add(1, "hour").format();

    const payload = {
      query,
      variables,
      operationName,
      nonce,
      expires_at: expiration,
    };

    const key = this.signingKey ?? this.nodeKeyCache.getKey(signingNodeId);
    if (!key) {
      throw new LightsparkSigningException(
        "Missing node of encrypted_signing_private_key",
      );
    }

    const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));

    const signedPayload = await key.sign(encodedPayload);

    const encodedSignedPayload = b64encode(signedPayload);
    headers["X-Lightspark-Signing"] = JSON.stringify({
      v: "1",
      signature: encodedSignedPayload,
    });
    return encodedPayload;
  }
}

async function compress(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data]).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream("deflate"));
  const reader = compressedStream.getReader();
  const chunks = [];
  let done, value;
  while (!done) {
    ({ done, value } = await reader.read()); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    chunks.push(value);
  }
  const blob = new Blob(chunks);
  return new Uint8Array(await blob.arrayBuffer());
}

export default Requester;

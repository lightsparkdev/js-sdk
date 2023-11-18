// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { Client as WsClient } from "graphql-ws";
import { createClient } from "graphql-ws";
import NodeWebSocket from "ws";
import { Observable } from "zen-observable-ts";

import type Query from "./Query.js";

import type AuthProvider from "../auth/AuthProvider.js";
import StubAuthProvider from "../auth/StubAuthProvider.js";
import type { CryptoInterface } from "../crypto/crypto.js";
import { DefaultCrypto, LightsparkSigningException } from "../crypto/crypto.js";
import type NodeKeyCache from "../crypto/NodeKeyCache.js";
import LightsparkException from "../LightsparkException.js";
import { logger } from "../Logger.js";
import { b64encode } from "../utils/base64.js";
import { isNode } from "../utils/environment.js";

const DEFAULT_BASE_URL = "api.lightspark.com";
export const LIGHTSPARK_BETA_HEADER_KEY = "X-Lightspark-Beta";
export const LIGHTSPARK_BETA_HEADER_VALUE =
  "z2h0BBYxTA83cjW7fi8QwWtBPCzkQKiemcuhKY08LOo";
dayjs.extend(utc);

type BodyData = {
  query: string;
  variables: { [key: string]: unknown };
  operationName: string;
  nonce?: number;
  expires_at?: string;
};

class Requester {
  private readonly wsClient: WsClient;
  constructor(
    private readonly nodeKeyCache: NodeKeyCache,
    private readonly schemaEndpoint: string,
    private readonly sdkUserAgent: string,
    private readonly authProvider: AuthProvider = new StubAuthProvider(),
    private readonly baseUrl: string = DEFAULT_BASE_URL,
    private readonly cryptoImpl: CryptoInterface = DefaultCrypto,
  ) {
    let websocketImpl;
    if (typeof WebSocket === "undefined" && typeof window === "undefined") {
      websocketImpl = NodeWebSocket;
    }
    let websocketProtocol = "wss";
    if (baseUrl.startsWith("http://")) {
      websocketProtocol = "ws";
    }
    this.wsClient = createClient({
      url: `${websocketProtocol}://${this.stripProtocol(this.baseUrl)}/${
        this.schemaEndpoint
      }`,
      connectionParams: () => authProvider.addWsConnectionParams({}),
      webSocketImpl: websocketImpl,
    });
    autoBind(this);
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
    logger.info(`Requester.subscribe variables`, variables);
    const operationNameRegex = /^\s*(query|mutation|subscription)\s+(\w+)/i;
    const operationMatch = queryPayload.match(operationNameRegex);
    if (!operationMatch || operationMatch.length < 3) {
      throw new LightsparkException("InvalidQuery", "Invalid query payload");
    }
    const operationType = operationMatch[1];
    logger.info(`Requester.subscribe operationType`, operationType);
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
      logger.info(`Requester.subscribe observer`, observer);
      return this.wsClient.subscribe(bodyData, {
        next: (data) => observer.next(data as { data: T }),
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });
    });
  }

  public async makeRawRequest(
    queryPayload: string,
    variables: { [key: string]: unknown } = {},
    signingNodeId: string | undefined = undefined,
    skipAuth: boolean = false,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- LIG-3400 */
  ): Promise<any> {
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
    let bodyData: BodyData = {
      query: queryPayload,
      variables,
      operationName: operation,
    };
    const browserUserAgent =
      typeof navigator !== "undefined" ? navigator.userAgent : "";
    const sdkUserAgent = this.getSdkUserAgent();
    const baseHeaders = {
      "Content-Type": "application/json",
      [LIGHTSPARK_BETA_HEADER_KEY]: LIGHTSPARK_BETA_HEADER_VALUE,
      "X-Lightspark-SDK": sdkUserAgent,
      "User-Agent": browserUserAgent || sdkUserAgent,
    };
    const headers = skipAuth
      ? baseHeaders
      : await this.authProvider.addAuthHeaders(baseHeaders);
    bodyData = await this.addSigningDataIfNeeded(
      bodyData,
      headers,
      signingNodeId,
    );

    let urlWithProtocol = this.baseUrl;
    if (
      !urlWithProtocol.startsWith("https://") &&
      !urlWithProtocol.startsWith("http://")
    ) {
      urlWithProtocol = `https://${urlWithProtocol}`;
    }

    const url = `${urlWithProtocol}/${this.schemaEndpoint}`;

    logger.info(`Requester.makeRawRequest`, {
      url,
      operationName: operation,
      variables,
    });
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(bodyData),
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
      throw new LightsparkException(
        "RequestFailed",
        `Request ${operation} failed. ${JSON.stringify(responseJson.errors)}`,
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
  ): Promise<BodyData> {
    if (!signingNodeId) {
      return queryPayload;
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

    const key = this.nodeKeyCache.getKey(signingNodeId);
    if (!key) {
      throw new LightsparkSigningException(
        "Missing node of encrypted_signing_private_key",
      );
    }

    let TextEncoderImpl = TextEncoder;
    if (typeof TextEncoder === "undefined") {
      TextEncoderImpl = (await import("text-encoding")).TextEncoder;
    }
    const encodedPayload = new TextEncoderImpl().encode(
      JSON.stringify(payload),
    );

    const signedPayload = await key.sign(encodedPayload);

    const encodedSignedPayload = b64encode(signedPayload);
    headers["X-Lightspark-Signing"] = JSON.stringify({
      v: "1",
      signature: encodedSignedPayload,
    });
    return payload;
  }
}

export default Requester;

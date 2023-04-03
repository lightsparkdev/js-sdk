// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import autoBind from "auto-bind";
import NodeCrypto from "crypto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { Client as WsClient, createClient } from "graphql-ws";
import NodeWebSocket from "ws";
import { Observable } from "zen-observable-ts";

import Query from "./Query.js";

import AuthProvider from "../auth/AuthProvider.js";
import StubAuthProvider from "../auth/StubAuthProvider.js";
import { getNonce, LightsparkSigningException } from "../crypto/crypto.js";
import NodeKeyCache from "../crypto/NodeKeyCache.js";
import LightsparkException from "../LightsparkException.js";
import { b64encode } from "../utils/base64.js";

const DEFAULT_BASE_URL = "api.lightspark.com";
const LIGHTSPARK_BETA_HEADER = "z2h0BBYxTA83cjW7fi8QwWtBPCzkQKiemcuhKY08LOo";
dayjs.extend(utc);

let cryptoImpl: typeof NodeCrypto | typeof crypto;
if (typeof crypto !== "undefined") {
  cryptoImpl = crypto;
} else {
  cryptoImpl = NodeCrypto;
}

class Requester {
  private readonly wsClient: WsClient;
  constructor(
    private readonly nodeKeyCache: NodeKeyCache,
    private readonly authProvider: AuthProvider = new StubAuthProvider(),
    private readonly baseUrl: string = DEFAULT_BASE_URL
  ) {
    let websocketImpl;
    if (typeof WebSocket === "undefined" && typeof window === "undefined") {
      websocketImpl = NodeWebSocket;
    }
    this.wsClient = createClient({
      url: `wss://${this.baseUrl}/graphql/release_candidate`,
      connectionParams: authProvider.addWsConnectionParams({}),
      webSocketImpl: websocketImpl,
    });
    autoBind(this);
  }

  public async executeQuery<T>(query: Query<T>): Promise<T | null> {
    const data = await this.makeRawRequest(
      query.queryPayload,
      query.variables || {}
    );
    return query.constructObject(data);
  }

  public subscribe(
    queryPayload: string,
    variables: { [key: string]: any } = {}
  ): Observable<any> {
    const operationNameRegex = /^\s*(query|mutation|subscription)\s+(\w+)/i;
    const operationMatch = queryPayload.match(operationNameRegex);
    if (!operationMatch || operationMatch.length < 3) {
      throw new LightsparkException("InvalidQuery", "Invalid query payload");
    }
    const operationType = operationMatch[1];
    if (operationType == "mutation") {
      throw new LightsparkException(
        "InvalidQuery",
        "Mutation queries should call makeRawRequest instead"
      );
    }
    // Undefined variables need to be null instead.
    for (const key in variables) {
      if (variables[key] === undefined) {
        variables[key] = null;
      }
    }
    const operation = operationMatch[2];
    let bodyData = {
      query: queryPayload,
      variables,
      operationName: operation,
    };

    return new Observable((observer) =>
      this.wsClient.subscribe(bodyData, {
        next: (data) => observer.next(data),
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      })
    );
  }

  public async makeRawRequest(
    queryPayload: string,
    variables: { [key: string]: any } = {},
    signingNodeId: string | undefined = undefined
  ): Promise<any | null> {
    const operationNameRegex = /^\s*(query|mutation|subscription)\s+(\w+)/i;
    const operationMatch = queryPayload.match(operationNameRegex);
    if (!operationMatch || operationMatch.length < 3) {
      throw new LightsparkException("InvalidQuery", "Invalid query payload");
    }
    const operationType = operationMatch[1];
    if (operationType == "subscription") {
      throw new LightsparkException(
        "InvalidQuery",
        "Subscription queries should call subscribe instead"
      );
    }
    // Undefined variables need to be null instead.
    for (const key in variables) {
      if (variables[key] === undefined) {
        variables[key] = null;
      }
    }
    const operation = operationMatch[2];
    let bodyData = {
      query: queryPayload,
      variables,
      operationName: operation,
    };
    const headers = await this.authProvider.addAuthHeaders({
      "Content-Type": "application/json",
      "X-Lightspark-Beta": LIGHTSPARK_BETA_HEADER,
    });
    bodyData = await this.addSigningDataIfNeeded(
      bodyData,
      headers,
      signingNodeId
    );

    const response = await fetch(
      `https://${this.baseUrl}/graphql/release_candidate`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(bodyData),
      }
    );
    if (!response.ok) {
      throw new LightsparkException(
        "RequestFailed",
        `Request ${operation} failed. ${response.statusText}`
      );
    }
    const responseJson = await response.json();
    const data = responseJson.data;
    if (!data) {
      throw new LightsparkException(
        "RequestFailed",
        `Request ${operation} failed. ${JSON.stringify(responseJson.errors)}`
      );
    }
    return data;
  }

  private async addSigningDataIfNeeded(
    queryPayload: { query: string; variables: any; operationName: string },
    headers: { [key: string]: string },
    signingNodeId: string | undefined
  ): Promise<any> {
    if (!signingNodeId) {
      return queryPayload;
    }

    const query = queryPayload.query;
    const variables = queryPayload.variables;
    const operationName = queryPayload.operationName;

    const nonce = getNonce();
    const expiration = dayjs.utc().add(1, "hour").format();

    const payload = {
      query,
      variables,
      operationName,
      nonce,
      expires_at: expiration,
    };

    const key = await this.nodeKeyCache.getKey(signingNodeId);
    if (!key) {
      throw new LightsparkSigningException(
        "Missing node of encrypted_signing_private_key"
      );
    }

    const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));

    const signedPayload = await cryptoImpl.subtle.sign(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      key,
      encodedPayload
    );
    const encodedSignedPayload = b64encode(signedPayload);

    headers["X-Lightspark-Signing"] = JSON.stringify({
      v: "1",
      signature: encodedSignedPayload,
    });
    return payload;
  }
}

export default Requester;

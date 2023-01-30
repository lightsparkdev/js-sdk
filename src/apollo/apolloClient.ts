// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client/core";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Headers } from "./constants";
import { b64encode } from "utils/base64";
import { getNonce } from "crypto/crypto";
import type { NormalizedCacheObject } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import NodeKeyCache from "crypto/NodeKeyCache";

const LIGHTSPARK_BETA_HEADER = "z2h0BBYxTA83cjW7fi8QwWtBPCzkQKiemcuhKY08LOo";

export const getNewApolloClient = (
  serverUrl: string,
  tokenId: string,
  token: string,
  nodeKeyCache: NodeKeyCache
): ApolloClient<NormalizedCacheObject> => {
  const httpLink = createHttpLink({
    uri: `${serverUrl}/graphql/2023-01-01`,
    headers: {
      "Content-Type": "application/json",
      "X-Lightspark-Beta": LIGHTSPARK_BETA_HEADER,
    },
    fetch: customFetchFn(nodeKeyCache),
  });

  const utf8AuthBytes = new TextEncoder().encode(`${tokenId}:${token}`);

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: `Basic ${b64encode(utf8AuthBytes)}`,
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache({
      possibleTypes: {
        // TODO autogenerate this, see:
        // https://www.apollographql.com/docs/react/data/fragments/#generating-possibletypes-automatically
        Node: ["GraphNode", "LightsparkNode"],
        Transaction: [
          "RoutingTransaction",
          "IncomingPayment",
          "OutgoingPayment",
          "OnChainTransaction",
        ],
        OnChainTransaction: [
          "Deposit",
          "Withdrawal",
          "ChannelOpeningTransaction",
          "ChannelClosingTransaction",
        ],
      },
    }),
    link: authLink.concat(httpLink),
  });
};

const customFetchFn = (nodeKeyCache: NodeKeyCache) => {
  return async (input: RequestInfo, init?: RequestInit) => {
    const headers = init?.headers ? (init?.headers as any) : null;
    const SigningNodeId = headers ? headers[Headers.SigningNodeId] : null;
    if (init && SigningNodeId) {
      delete headers[Headers.SigningNodeId];

      const operation = JSON.parse(init.body as string);
      const query = operation.query;
      const variables = operation.variables;
      const operationName = operation.operationName;

      const nonce = getNonce();
      const expiration = dayjs.utc().add(1, "hour").format();

      const payload = JSON.stringify({
        query,
        variables,
        operationName,
        nonce,
        expires_at: expiration,
      });

      const key = await nodeKeyCache.getKey(SigningNodeId);
      if (!key) {
        throw new Error("Missing node of encrypted_signing_private_key");
      }

      const encodedPayload = new TextEncoder().encode(payload);

      const signedPayload = await crypto.subtle.sign(
        {
          name: "RSA-PSS",
          saltLength: 32,
        },
        key,
        encodedPayload
      );
      const encodedSignedPayload = b64encode(signedPayload);

      init.body = payload;
      headers[Headers.OperationSigningDetails] = JSON.stringify({
        v: "1",
        signature: encodedSignedPayload,
      });
    }
    return fetch(input, init);
  };
};

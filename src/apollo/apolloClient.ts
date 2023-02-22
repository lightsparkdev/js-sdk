// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client/core/index.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { Headers } from "./constants.js";
import { b64encode } from "../utils/base64.js";
import { getNonce } from "../crypto/crypto.js";
import { setContext } from "@apollo/client/link/context/index.js";
import NodeKeyCache from "../crypto/NodeKeyCache.js";
import AuthProvider from "../auth/AuthProvider.js";
import StubAuthProvider from "../auth/StubAuthProvider.js";
import { ApolloLink, split } from "@apollo/client/link/core/index.js";
import { createHttpLink } from "@apollo/client/link/http/index.js";
import { NormalizedCacheObject } from "@apollo/client/cache/inmemory/types.js";
import { getMainDefinition } from "@apollo/client/utilities/graphql/getFromAST.js";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions/index.js";
import { createClient } from "graphql-ws";

const LIGHTSPARK_BETA_HEADER = "z2h0BBYxTA83cjW7fi8QwWtBPCzkQKiemcuhKY08LOo";
dayjs.extend(utc);

export const getNewApolloClient = (
  serverUrl: string,
  nodeKeyCache: NodeKeyCache,
  authProvider: AuthProvider = new StubAuthProvider()
): ApolloClient<NormalizedCacheObject> => {
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
    link: getLinks(serverUrl, nodeKeyCache, authProvider),
  });
};

export const setApolloClientOptions = (
  apolloClient: ApolloClient<NormalizedCacheObject>,
  serverUrl: string,
  nodeKeyCache: NodeKeyCache,
  authProvider: AuthProvider
) => {
  apolloClient.setLink(getLinks(serverUrl, nodeKeyCache, authProvider));
};

const getLinks = (
  serverUrl: string,
  nodeKeyCache: NodeKeyCache,
  authProvider: AuthProvider
): ApolloLink => {
  const httpLink = createHttpLink({
    uri: `https://${serverUrl}/graphql/2023-01-01`,
    headers: {
      "Content-Type": "application/json",
      "X-Lightspark-Beta": LIGHTSPARK_BETA_HEADER,
    },
    fetch: customFetchFn(nodeKeyCache),
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: `wss://${serverUrl}/graphql/2023-01-01`,
      connectionParams: authProvider.addWsConnectionParams({})
    })
  );

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

  const authLink = setContext(async (_, { headers }) => {
    return {
      headers: await authProvider.addAuthHeaders(headers),
    };
  });

  return authLink.concat(splitLink);
};

const customFetchFn = (nodeKeyCache: NodeKeyCache) => {
  return async (input: RequestInfo, init?: RequestInit) => {
    const headers = init?.headers ? (init?.headers as any) : null;
    const signingNodeId = headers ? headers[Headers.SigningNodeId] : null;
    if (!init || !signingNodeId) {
      return fetch(input, init);
    }

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

    const key = await nodeKeyCache.getKey(signingNodeId);
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
    return fetch(input, init);
  };
};

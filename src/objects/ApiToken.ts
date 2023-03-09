// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Entity from "./Entity.js";
import Query from "../requester/Query.js";

type ApiToken = Entity & {
  /** The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque string. **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** An opaque identifier that should be used as a client_id (or username) in the HTTP Basic Authentication scheme when issuing requests against the Lightspark API. **/
  clientId: string;

  /** An arbitrary name chosen by the creator of the token to help identify the token in the list of tokens that have been created for the account. **/
  name: string;

  /** The typename of the object **/
  typename: string;
};

export const ApiTokenFromJson = (obj: any): ApiToken => {
  return {
    id: obj["api_token_id"],
    createdAt: obj["api_token_created_at"],
    updatedAt: obj["api_token_updated_at"],
    clientId: obj["api_token_client_id"],
    name: obj["api_token_name"],
    typename: "ApiToken",
  } as ApiToken;
};

export const FRAGMENT = `
fragment ApiTokenFragment on ApiToken {
    __typename
    api_token_id: id
    api_token_created_at: created_at
    api_token_updated_at: updated_at
    api_token_client_id: client_id
    api_token_name: name
}`;

export const getApiTokenQuery = (id: string): Query<ApiToken> => {
  return {
    queryPayload: `
query GetApiToken($id: ID!) {
    entity(id: $id) {
        ... on ApiToken {
            ...ApiTokenFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => ApiTokenFromJson(data.entity),
  };
};

export default ApiToken;

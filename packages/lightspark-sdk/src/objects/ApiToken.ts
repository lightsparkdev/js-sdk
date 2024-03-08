// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import Permission from "./Permission.js";

/**
 * This is an object representing a Lightspark API token, that can be used to authenticate this
 * account when making API calls or using our SDKs. See the “Authentication” section of our API
 * docs for more details on its usage. *
 */
interface ApiToken {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /**
   * An opaque identifier that should be used as a client_id (or username) in the HTTP Basic
   * Authentication scheme when issuing requests against the Lightspark API.
   **/
  clientId: string;

  /**
   * An arbitrary name chosen by the creator of the token to help identify the token in the list
   * of tokens that have been created for the account.
   **/
  name: string;

  /** A list of permissions granted to the token. **/
  permissions: Permission[];

  /** Whether the api token has been deleted. **/
  isDeleted: boolean;

  /** The typename of the object **/
  typename: string;
}

export const ApiTokenFromJson = (obj: any): ApiToken => {
  return {
    id: obj["api_token_id"],
    createdAt: obj["api_token_created_at"],
    updatedAt: obj["api_token_updated_at"],
    clientId: obj["api_token_client_id"],
    name: obj["api_token_name"],
    permissions: obj["api_token_permissions"].map((e) => Permission[e]),
    isDeleted: obj["api_token_is_deleted"],
    typename: "ApiToken",
  } as ApiToken;
};
export const ApiTokenToJson = (obj: ApiToken): any => {
  return {
    __typename: "ApiToken",
    api_token_id: obj.id,
    api_token_created_at: obj.createdAt,
    api_token_updated_at: obj.updatedAt,
    api_token_client_id: obj.clientId,
    api_token_name: obj.name,
    api_token_permissions: obj.permissions,
    api_token_is_deleted: obj.isDeleted,
  };
};

export const FRAGMENT = `
fragment ApiTokenFragment on ApiToken {
    __typename
    api_token_id: id
    api_token_created_at: created_at
    api_token_updated_at: updated_at
    api_token_client_id: client_id
    api_token_name: name
    api_token_permissions: permissions
    api_token_is_deleted: is_deleted
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

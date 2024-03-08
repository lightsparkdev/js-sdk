// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException, type Query } from "@lightsparkdev/core";
import type ApiToken from "./ApiToken.js";
import Permission from "./Permission.js";

/** Audit log actor who called the GraphQL mutation **/
interface AuditLogActor {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The typename of the object **/
  typename: string;
}

export const AuditLogActorFromJson = (obj: any): AuditLogActor => {
  if (obj["__typename"] == "ApiToken") {
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
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface AuditLogActor corresponding to the typename=${obj["__typename"]}`,
  );
};
export const AuditLogActorToJson = (obj: AuditLogActor): any => {
  if (obj.typename == "ApiToken") {
    const apiToken = obj as ApiToken;
    return {
      __typename: "ApiToken",
      api_token_id: apiToken.id,
      api_token_created_at: apiToken.createdAt,
      api_token_updated_at: apiToken.updatedAt,
      api_token_client_id: apiToken.clientId,
      api_token_name: apiToken.name,
      api_token_permissions: apiToken.permissions,
      api_token_is_deleted: apiToken.isDeleted,
    };
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface AuditLogActor corresponding to the typename=${obj.typename}`,
  );
};

export const FRAGMENT = `
fragment AuditLogActorFragment on AuditLogActor {
    __typename
    ... on ApiToken {
        __typename
        api_token_id: id
        api_token_created_at: created_at
        api_token_updated_at: updated_at
        api_token_client_id: client_id
        api_token_name: name
        api_token_permissions: permissions
        api_token_is_deleted: is_deleted
    }
}`;

export const getAuditLogActorQuery = (id: string): Query<AuditLogActor> => {
  return {
    queryPayload: `
query GetAuditLogActor($id: ID!) {
    entity(id: $id) {
        ... on AuditLogActor {
            ...AuditLogActorFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => AuditLogActorFromJson(data.entity),
  };
};

export default AuditLogActor;

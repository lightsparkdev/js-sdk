// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";

interface Signable {
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

export const SignableFromJson = (obj: any): Signable => {
  return {
    id: obj["signable_id"],
    createdAt: obj["signable_created_at"],
    updatedAt: obj["signable_updated_at"],
    typename: "Signable",
  } as Signable;
};
export const SignableToJson = (obj: Signable): any => {
  return {
    __typename: "Signable",
    signable_id: obj.id,
    signable_created_at: obj.createdAt,
    signable_updated_at: obj.updatedAt,
  };
};

export const FRAGMENT = `
fragment SignableFragment on Signable {
    __typename
    signable_id: id
    signable_created_at: created_at
    signable_updated_at: updated_at
}`;

export const getSignableQuery = (id: string): Query<Signable> => {
  return {
    queryPayload: `
query GetSignable($id: ID!) {
    entity(id: $id) {
        ... on Signable {
            ...SignableFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => SignableFromJson(data.entity),
  };
};

export default Signable;

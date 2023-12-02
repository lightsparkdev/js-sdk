// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { type Query } from "@lightsparkdev/core";
import SignablePayloadStatus from "./SignablePayloadStatus.js";

interface SignablePayload {
  /**
   * The unique identifier of this entity across all Lightspark systems. Should be treated as an
   * opaque string.
   **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The payload that needs to be signed. **/
  payload: string;

  /**
   * The consistent method for generating the same set of accounts and wallets for a given
   * private key *
   */
  derivationPath: string;

  /** The status of the payload. **/
  status: SignablePayloadStatus;

  /** The signable this payload belongs to. **/
  signableId: string;

  /** The typename of the object **/
  typename: string;

  /** The tweak value to add. **/
  addTweak?: string | undefined;

  /** The tweak value to multiply. **/
  mulTweak?: string | undefined;
}

export const SignablePayloadFromJson = (obj: any): SignablePayload => {
  return {
    id: obj["signable_payload_id"],
    createdAt: obj["signable_payload_created_at"],
    updatedAt: obj["signable_payload_updated_at"],
    payload: obj["signable_payload_payload"],
    derivationPath: obj["signable_payload_derivation_path"],
    status:
      SignablePayloadStatus[obj["signable_payload_status"]] ??
      SignablePayloadStatus.FUTURE_VALUE,
    signableId: obj["signable_payload_signable"].id,
    typename: "SignablePayload",
    addTweak: obj["signable_payload_add_tweak"],
    mulTweak: obj["signable_payload_mul_tweak"],
  } as SignablePayload;
};
export const SignablePayloadToJson = (obj: SignablePayload): any => {
  return {
    __typename: "SignablePayload",
    signable_payload_id: obj.id,
    signable_payload_created_at: obj.createdAt,
    signable_payload_updated_at: obj.updatedAt,
    signable_payload_payload: obj.payload,
    signable_payload_derivation_path: obj.derivationPath,
    signable_payload_status: obj.status,
    signable_payload_add_tweak: obj.addTweak,
    signable_payload_mul_tweak: obj.mulTweak,
    signable_payload_signable: { id: obj.signableId },
  };
};

export const FRAGMENT = `
fragment SignablePayloadFragment on SignablePayload {
    __typename
    signable_payload_id: id
    signable_payload_created_at: created_at
    signable_payload_updated_at: updated_at
    signable_payload_payload: payload
    signable_payload_derivation_path: derivation_path
    signable_payload_status: status
    signable_payload_add_tweak: add_tweak
    signable_payload_mul_tweak: mul_tweak
    signable_payload_signable: signable {
        id
    }
}`;

export const getSignablePayloadQuery = (id: string): Query<SignablePayload> => {
  return {
    queryPayload: `
query GetSignablePayload($id: ID!) {
    entity(id: $id) {
        ... on SignablePayload {
            ...SignablePayloadFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => SignablePayloadFromJson(data.entity),
  };
};

export default SignablePayload;

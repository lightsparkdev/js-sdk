// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Query from "../requester/Query.js";
import Entity from "./Entity.js";
import LoginFactor from "./LoginFactor.js";

type WebAuthnLoginFactor = LoginFactor &
  Entity & {
    /** The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque string. **/
    id: string;

    /** The date and time when the entity was first created. **/
    createdAt: string;

    /** The date and time when the entity was last updated. **/
    updatedAt: string;

    /** The name of this login factor, chosen by the user to help identify the login factor in a list. **/
    name: string;

    /** The typename of the object **/
    typename: string;

    /** The date when this login factor was verified and activated. **/
    verificationDate?: string;
  };

export const WebAuthnLoginFactorFromJson = (obj: any): WebAuthnLoginFactor => {
  return {
    id: obj["web_authn_login_factor_id"],
    createdAt: obj["web_authn_login_factor_created_at"],
    updatedAt: obj["web_authn_login_factor_updated_at"],
    name: obj["web_authn_login_factor_name"],
    typename: "WebAuthnLoginFactor",
    verificationDate: obj["web_authn_login_factor_verification_date"],
  } as WebAuthnLoginFactor;
};

export const FRAGMENT = `
fragment WebAuthnLoginFactorFragment on WebAuthnLoginFactor {
    __typename
    web_authn_login_factor_id: id
    web_authn_login_factor_created_at: created_at
    web_authn_login_factor_updated_at: updated_at
    web_authn_login_factor_verification_date: verification_date
    web_authn_login_factor_name: name
}`;

export const getWebAuthnLoginFactorQuery = (
  id: string
): Query<WebAuthnLoginFactor> => {
  return {
    queryPayload: `
query GetWebAuthnLoginFactor($id: ID!) {
    entity(id: $id) {
        ... on WebAuthnLoginFactor {
            ...WebAuthnLoginFactorFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => WebAuthnLoginFactorFromJson(data.entity),
  };
};

export default WebAuthnLoginFactor;

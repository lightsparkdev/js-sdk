// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Query from "../requester/Query.js";
import Entity from "./Entity.js";
import PhoneLoginFactor from "./PhoneLoginFactor.js";
import TotpLoginFactor from "./TotpLoginFactor.js";
import WebAuthnLoginFactor from "./WebAuthnLoginFactor.js";

type LoginFactor = Entity & {
  /** The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque string. **/
  id: string;

  /** The date and time when the entity was first created. **/
  createdAt: string;

  /** The date and time when the entity was last updated. **/
  updatedAt: string;

  /** The typename of the object **/
  typename: string;

  /** The date when this login factor was verified and activated. **/
  verificationDate?: string;
};

export const LoginFactorFromJson = (obj: any): LoginFactor => {
  if (obj["__typename"] == "PhoneLoginFactor") {
    return {
      id: obj["phone_login_factor_id"],
      createdAt: obj["phone_login_factor_created_at"],
      updatedAt: obj["phone_login_factor_updated_at"],
      phoneNumber: obj["phone_login_factor_phone_number"],
      typename: "PhoneLoginFactor",
      verificationDate: obj["phone_login_factor_verification_date"],
    } as PhoneLoginFactor;
  }
  if (obj["__typename"] == "TotpLoginFactor") {
    return {
      id: obj["totp_login_factor_id"],
      createdAt: obj["totp_login_factor_created_at"],
      updatedAt: obj["totp_login_factor_updated_at"],
      version: obj["totp_login_factor_version"],
      typename: "TotpLoginFactor",
      verificationDate: obj["totp_login_factor_verification_date"],
    } as TotpLoginFactor;
  }
  if (obj["__typename"] == "WebAuthnLoginFactor") {
    return {
      id: obj["web_authn_login_factor_id"],
      createdAt: obj["web_authn_login_factor_created_at"],
      updatedAt: obj["web_authn_login_factor_updated_at"],
      name: obj["web_authn_login_factor_name"],
      typename: "WebAuthnLoginFactor",
      verificationDate: obj["web_authn_login_factor_verification_date"],
    } as WebAuthnLoginFactor;
  }
  throw new Error(
    `Couldn't find a concrete type for interface LoginFactor corresponding to the typename=${obj["__typename"]}`
  );
};

export const FRAGMENT = `
fragment LoginFactorFragment on LoginFactor {
    __typename
    ... on PhoneLoginFactor {
        __typename
        phone_login_factor_id: id
        phone_login_factor_created_at: created_at
        phone_login_factor_updated_at: updated_at
        phone_login_factor_verification_date: verification_date
        phone_login_factor_phone_number: phone_number
    }
    ... on TotpLoginFactor {
        __typename
        totp_login_factor_id: id
        totp_login_factor_created_at: created_at
        totp_login_factor_updated_at: updated_at
        totp_login_factor_verification_date: verification_date
        totp_login_factor_version: version
    }
    ... on WebAuthnLoginFactor {
        __typename
        web_authn_login_factor_id: id
        web_authn_login_factor_created_at: created_at
        web_authn_login_factor_updated_at: updated_at
        web_authn_login_factor_verification_date: verification_date
        web_authn_login_factor_name: name
    }
}`;

export const getLoginFactorQuery = (id: string): Query<LoginFactor> => {
  return {
    queryPayload: `
query GetLoginFactor($id: ID!) {
    entity(id: $id) {
        ... on LoginFactor {
            ...LoginFactorFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => LoginFactorFromJson(data.entity),
  };
};

export default LoginFactor;

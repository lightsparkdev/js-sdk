// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Query from "../requester/Query.js";
import Entity from "./Entity.js";
import LoginFactor from "./LoginFactor.js";

type TotpLoginFactor = LoginFactor &
  Entity & {
    /** The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque string. **/
    id: string;

    /** The date and time when the entity was first created. **/
    createdAt: string;

    /** The date and time when the entity was last updated. **/
    updatedAt: string;

    /** The version of TOTP that is used for this login factor. It helps determine the number of digits to use in the verification code. **/
    version: number;

    /** The typename of the object **/
    typename: string;

    /** The date when this login factor was verified and activated. **/
    verificationDate?: string;
  };

export const TotpLoginFactorFromJson = (obj: any): TotpLoginFactor => {
  return {
    id: obj["totp_login_factor_id"],
    createdAt: obj["totp_login_factor_created_at"],
    updatedAt: obj["totp_login_factor_updated_at"],
    version: obj["totp_login_factor_version"],
    typename: "TotpLoginFactor",
    verificationDate: obj["totp_login_factor_verification_date"],
  } as TotpLoginFactor;
};

export const FRAGMENT = `
fragment TotpLoginFactorFragment on TotpLoginFactor {
    __typename
    totp_login_factor_id: id
    totp_login_factor_created_at: created_at
    totp_login_factor_updated_at: updated_at
    totp_login_factor_verification_date: verification_date
    totp_login_factor_version: version
}`;

export const getTotpLoginFactorQuery = (id: string): Query<TotpLoginFactor> => {
  return {
    queryPayload: `
query GetTotpLoginFactor($id: ID!) {
    entity(id: $id) {
        ... on TotpLoginFactor {
            ...TotpLoginFactorFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => TotpLoginFactorFromJson(data.entity),
  };
};

export default TotpLoginFactor;

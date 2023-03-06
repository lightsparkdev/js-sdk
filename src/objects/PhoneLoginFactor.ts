// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import Query from "../requester/Query.js";
import Entity from "./Entity.js";
import LoginFactor from "./LoginFactor.js";

type PhoneLoginFactor = LoginFactor &
  Entity & {
    /** The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque string. **/
    id: string;

    /** The date and time when the entity was first created. **/
    createdAt: string;

    /** The date and time when the entity was last updated. **/
    updatedAt: string;

    /** The phone number used for this login factor. **/
    phoneNumber: string;

    /** The typename of the object **/
    typename: string;

    /** The date when this login factor was verified and activated. **/
    verificationDate?: string;
  };

export const PhoneLoginFactorFromJson = (obj: any): PhoneLoginFactor => {
  return {
    id: obj["phone_login_factor_id"],
    createdAt: obj["phone_login_factor_created_at"],
    updatedAt: obj["phone_login_factor_updated_at"],
    phoneNumber: obj["phone_login_factor_phone_number"],
    typename: "PhoneLoginFactor",
    verificationDate: obj["phone_login_factor_verification_date"],
  } as PhoneLoginFactor;
};

export const FRAGMENT = `
fragment PhoneLoginFactorFragment on PhoneLoginFactor {
    __typename
    phone_login_factor_id: id
    phone_login_factor_created_at: created_at
    phone_login_factor_updated_at: updated_at
    phone_login_factor_verification_date: verification_date
    phone_login_factor_phone_number: phone_number
}`;

export const getPhoneLoginFactorQuery = (
  id: string
): Query<PhoneLoginFactor> => {
  return {
    queryPayload: `
query GetPhoneLoginFactor($id: ID!) {
    entity(id: $id) {
        ... on PhoneLoginFactor {
            ...PhoneLoginFactorFragment
        }
    }
}

${FRAGMENT}    
`,
    variables: { id },
    constructObject: (data: any) => PhoneLoginFactorFromJson(data.entity),
  };
};

export default PhoneLoginFactor;

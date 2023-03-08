// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import ApiToken, { ApiTokenFromJson } from "./ApiToken.js";

type CreateApiTokenOutput = {
  /** The API Token that has been created. **/
  apiToken: ApiToken;

  /** The secret that should be used to authenticate against our API.
This secret is not stored and will never be available again after this. You must keep this secret secure as it grants access to your account. **/
  clientSecret: string;
};

export const CreateApiTokenOutputFromJson = (
  obj: any
): CreateApiTokenOutput => {
  return {
    apiToken: ApiTokenFromJson(obj["create_api_token_output_api_token"]),
    clientSecret: obj["create_api_token_output_client_secret"],
  } as CreateApiTokenOutput;
};

export const FRAGMENT = `
fragment CreateApiTokenOutputFragment on CreateApiTokenOutput {
    __typename
    create_api_token_output_api_token: api_token {
        __typename
        api_token_id: id
        api_token_created_at: created_at
        api_token_updated_at: updated_at
        api_token_client_id: client_id
        api_token_name: name
    }
    create_api_token_output_client_secret: client_secret
}`;

export default CreateApiTokenOutput;

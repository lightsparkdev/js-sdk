// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type CreateApiTokenOutput = {
  /** The API Token that has been created. **/
  apiTokenId: string;

  /** The secret that should be used to authenticate against our API.
This secret is not stored and will never be available again after this. You must keep this secret secure as it grants access to your account. **/
  clientSecret: string;
};

export const CreateApiTokenOutputFromJson = (
  obj: any
): CreateApiTokenOutput => {
  return {
    apiTokenId: obj["create_api_token_output_api_token"].id,
    clientSecret: obj["create_api_token_output_client_secret"],
  } as CreateApiTokenOutput;
};

export const FRAGMENT = `
fragment CreateApiTokenOutputFragment on CreateApiTokenOutput {
    __typename
    create_api_token_output_api_token: api_token {
        id
    }
    create_api_token_output_client_secret: client_secret
}`;

export default CreateApiTokenOutput;

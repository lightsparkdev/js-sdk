// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type CreateApiTokenInput = {
  /** An arbitrary name that the user can choose to identify the API token in a list. **/
  name: string;
};

export const CreateApiTokenInputFromJson = (obj: any): CreateApiTokenInput => {
  return {
    name: obj["create_api_token_input_name"],
  } as CreateApiTokenInput;
};

export default CreateApiTokenInput;

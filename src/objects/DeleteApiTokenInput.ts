// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type DeleteApiTokenInput = {
  apiTokenId: string;
};

export const DeleteApiTokenInputFromJson = (obj: any): DeleteApiTokenInput => {
  return {
    apiTokenId: obj["delete_api_token_input_api_token_id"],
  } as DeleteApiTokenInput;
};

export default DeleteApiTokenInput;

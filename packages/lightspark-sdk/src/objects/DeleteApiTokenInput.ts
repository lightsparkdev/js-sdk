// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface DeleteApiTokenInput {
  apiTokenId: string;
}

export const DeleteApiTokenInputFromJson = (obj: any): DeleteApiTokenInput => {
  return {
    apiTokenId: obj["delete_api_token_input_api_token_id"],
  } as DeleteApiTokenInput;
};
export const DeleteApiTokenInputToJson = (obj: DeleteApiTokenInput): any => {
  return {
    delete_api_token_input_api_token_id: obj.apiTokenId,
  };
};

export default DeleteApiTokenInput;

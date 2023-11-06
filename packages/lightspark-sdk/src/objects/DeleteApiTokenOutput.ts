// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface DeleteApiTokenOutput {
  accountId: string;
}

export const DeleteApiTokenOutputFromJson = (
  obj: any,
): DeleteApiTokenOutput => {
  return {
    accountId: obj["delete_api_token_output_account"].id,
  } as DeleteApiTokenOutput;
};
export const DeleteApiTokenOutputToJson = (obj: DeleteApiTokenOutput): any => {
  return {
    delete_api_token_output_account: { id: obj.accountId },
  };
};

export const FRAGMENT = `
fragment DeleteApiTokenOutputFragment on DeleteApiTokenOutput {
    __typename
    delete_api_token_output_account: account {
        id
    }
}`;

export default DeleteApiTokenOutput;

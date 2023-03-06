// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type DeleteApiTokenOutput = {
  accountId: string;
};

export const DeleteApiTokenOutputFromJson = (
  obj: any
): DeleteApiTokenOutput => {
  return {
    accountId: obj["delete_api_token_output_account"].id,
  } as DeleteApiTokenOutput;
};

export const FRAGMENT = `
fragment DeleteApiTokenOutputFragment on DeleteApiTokenOutput {
    __typename
    delete_api_token_output_account: account {
        id
    }
}`;

export default DeleteApiTokenOutput;

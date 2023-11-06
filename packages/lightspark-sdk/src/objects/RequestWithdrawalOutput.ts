// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface RequestWithdrawalOutput {
  /** The request that is created for this withdrawal. **/
  requestId: string;
}

export const RequestWithdrawalOutputFromJson = (
  obj: any,
): RequestWithdrawalOutput => {
  return {
    requestId: obj["request_withdrawal_output_request"].id,
  } as RequestWithdrawalOutput;
};
export const RequestWithdrawalOutputToJson = (
  obj: RequestWithdrawalOutput,
): any => {
  return {
    request_withdrawal_output_request: { id: obj.requestId },
  };
};

export const FRAGMENT = `
fragment RequestWithdrawalOutputFragment on RequestWithdrawalOutput {
    __typename
    request_withdrawal_output_request: request {
        id
    }
}`;

export default RequestWithdrawalOutput;

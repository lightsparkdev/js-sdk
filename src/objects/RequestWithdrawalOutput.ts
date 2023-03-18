// Copyright ©, 2022, Lightspark Group, Inc. - All Rights Reserved

type RequestWithdrawalOutput = {
  /** The request that is created for this withdrawal. **/
  requestId: string;
};

export const RequestWithdrawalOutputFromJson = (
  obj: any
): RequestWithdrawalOutput => {
  return {
    requestId: obj["request_withdrawal_output_request"].id,
  } as RequestWithdrawalOutput;
};

export const FRAGMENT = `
fragment RequestWithdrawalOutputFragment on RequestWithdrawalOutput {
    __typename
    request_withdrawal_output_request: request {
        id
    }
}`;

export default RequestWithdrawalOutput;

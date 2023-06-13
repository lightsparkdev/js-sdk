// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type DeleteFundsRecoveryKitOutput = {
  walletId: string;
};

export const DeleteFundsRecoveryKitOutputFromJson = (
  obj: any
): DeleteFundsRecoveryKitOutput => {
  return {
    walletId: obj["delete_funds_recovery_kit_output_wallet"].id,
  } as DeleteFundsRecoveryKitOutput;
};

export const FRAGMENT = `
fragment DeleteFundsRecoveryKitOutputFragment on DeleteFundsRecoveryKitOutput {
    __typename
    delete_funds_recovery_kit_output_wallet: wallet {
        id
    }
}`;

export default DeleteFundsRecoveryKitOutput;

// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type UpdateFundsRecoveryKitInput = {
  s3BucketUrl: string;

  bitcoinWalletAddress: string;
};

export const UpdateFundsRecoveryKitInputFromJson = (
  obj: any,
): UpdateFundsRecoveryKitInput => {
  return {
    s3BucketUrl: obj["update_funds_recovery_kit_input_s3_bucket_url"],
    bitcoinWalletAddress:
      obj["update_funds_recovery_kit_input_bitcoin_wallet_address"],
  } as UpdateFundsRecoveryKitInput;
};

export default UpdateFundsRecoveryKitInput;

// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface UpdateFundsRecoveryKitInput {
  s3BucketUrl: string;

  bitcoinWalletAddress: string;
}

export const UpdateFundsRecoveryKitInputFromJson = (
  obj: any,
): UpdateFundsRecoveryKitInput => {
  return {
    s3BucketUrl: obj["update_funds_recovery_kit_input_s3_bucket_url"],
    bitcoinWalletAddress:
      obj["update_funds_recovery_kit_input_bitcoin_wallet_address"],
  } as UpdateFundsRecoveryKitInput;
};
export const UpdateFundsRecoveryKitInputToJson = (
  obj: UpdateFundsRecoveryKitInput,
): any => {
  return {
    update_funds_recovery_kit_input_s3_bucket_url: obj.s3BucketUrl,
    update_funds_recovery_kit_input_bitcoin_wallet_address:
      obj.bitcoinWalletAddress,
  };
};

export default UpdateFundsRecoveryKitInput;

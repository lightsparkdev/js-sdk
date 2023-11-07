// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import type FundsRecoveryKit from "./FundsRecoveryKit.js";
import {
  FundsRecoveryKitFromJson,
  FundsRecoveryKitToJson,
} from "./FundsRecoveryKit.js";

interface UpdateFundsRecoveryKitOutput {
  walletId: string;

  fundsRecoveryKit: FundsRecoveryKit;
}

export const UpdateFundsRecoveryKitOutputFromJson = (
  obj: any,
): UpdateFundsRecoveryKitOutput => {
  return {
    walletId: obj["update_funds_recovery_kit_output_wallet"].id,
    fundsRecoveryKit: FundsRecoveryKitFromJson(
      obj["update_funds_recovery_kit_output_funds_recovery_kit"],
    ),
  } as UpdateFundsRecoveryKitOutput;
};
export const UpdateFundsRecoveryKitOutputToJson = (
  obj: UpdateFundsRecoveryKitOutput,
): any => {
  return {
    update_funds_recovery_kit_output_wallet: { id: obj.walletId },
    update_funds_recovery_kit_output_funds_recovery_kit: FundsRecoveryKitToJson(
      obj.fundsRecoveryKit,
    ),
  };
};

export const FRAGMENT = `
fragment UpdateFundsRecoveryKitOutputFragment on UpdateFundsRecoveryKitOutput {
    __typename
    update_funds_recovery_kit_output_wallet: wallet {
        id
    }
    update_funds_recovery_kit_output_funds_recovery_kit: funds_recovery_kit {
        __typename
        ... on AmazonS3FundsRecoveryKit {
            __typename
            amazon_s3_funds_recovery_kit_bitcoin_wallet_address: bitcoin_wallet_address
            amazon_s3_funds_recovery_kit_s3_bucket_url: s3_bucket_url
        }
    }
}`;

export default UpdateFundsRecoveryKitOutput;

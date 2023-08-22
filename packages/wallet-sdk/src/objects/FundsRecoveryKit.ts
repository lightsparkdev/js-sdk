// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import { LightsparkException } from "@lightsparkdev/core";
import type AmazonS3FundsRecoveryKit from "./AmazonS3FundsRecoveryKit.js";

type FundsRecoveryKit = {
  /** The bitcoin address where the funds should be sent if the recovery kit is used. **/
  bitcoinWalletAddress: string;

  /** The typename of the object **/
  typename: string;
};

export const FundsRecoveryKitFromJson = (obj: any): FundsRecoveryKit => {
  if (obj["__typename"] == "AmazonS3FundsRecoveryKit") {
    return {
      bitcoinWalletAddress:
        obj["amazon_s3_funds_recovery_kit_bitcoin_wallet_address"],
      s3BucketUrl: obj["amazon_s3_funds_recovery_kit_s3_bucket_url"],
      typename: "AmazonS3FundsRecoveryKit",
    } as AmazonS3FundsRecoveryKit;
  }
  throw new LightsparkException(
    "DeserializationError",
    `Couldn't find a concrete type for interface FundsRecoveryKit corresponding to the typename=${obj["__typename"]}`,
  );
};

export const FRAGMENT = `
fragment FundsRecoveryKitFragment on FundsRecoveryKit {
    __typename
    ... on AmazonS3FundsRecoveryKit {
        __typename
        amazon_s3_funds_recovery_kit_bitcoin_wallet_address: bitcoin_wallet_address
        amazon_s3_funds_recovery_kit_s3_bucket_url: s3_bucket_url
    }
}`;

export default FundsRecoveryKit;

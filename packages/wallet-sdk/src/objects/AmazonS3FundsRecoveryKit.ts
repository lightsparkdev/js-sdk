// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface AmazonS3FundsRecoveryKit {
  /** The bitcoin address where the funds should be sent if the recovery kit is used. **/
  bitcoinWalletAddress: string;

  /** The URL of the Amazon S3 bucket URL where we should upload the funds recovery kit. **/
  s3BucketUrl: string;

  /** The typename of the object **/
  typename: string;
}

export const AmazonS3FundsRecoveryKitFromJson = (
  obj: any,
): AmazonS3FundsRecoveryKit => {
  return {
    bitcoinWalletAddress:
      obj["amazon_s3_funds_recovery_kit_bitcoin_wallet_address"],
    s3BucketUrl: obj["amazon_s3_funds_recovery_kit_s3_bucket_url"],
    typename: "AmazonS3FundsRecoveryKit",
  } as AmazonS3FundsRecoveryKit;
};
export const AmazonS3FundsRecoveryKitToJson = (
  obj: AmazonS3FundsRecoveryKit,
): any => {
  return {
    __typename: "AmazonS3FundsRecoveryKit",
    amazon_s3_funds_recovery_kit_bitcoin_wallet_address:
      obj.bitcoinWalletAddress,
    amazon_s3_funds_recovery_kit_s3_bucket_url: obj.s3BucketUrl,
  };
};

export const FRAGMENT = `
fragment AmazonS3FundsRecoveryKitFragment on AmazonS3FundsRecoveryKit {
    __typename
    amazon_s3_funds_recovery_kit_bitcoin_wallet_address: bitcoin_wallet_address
    amazon_s3_funds_recovery_kit_s3_bucket_url: s3_bucket_url
}`;

export default AmazonS3FundsRecoveryKit;

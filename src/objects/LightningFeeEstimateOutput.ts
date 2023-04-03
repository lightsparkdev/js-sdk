// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type LightningFeeEstimateOutput = {
  /** The estimated fees for the payment expressed in msats. **/
  feeEstimateMsat: number;
};

export const LightningFeeEstimateOutputFromJson = (
  obj: any
): LightningFeeEstimateOutput => {
  return {
    feeEstimateMsat: obj["lightning_fee_estimate_output_fee_estimate_msat"],
  } as LightningFeeEstimateOutput;
};

export const FRAGMENT = `
fragment LightningFeeEstimateOutputFragment on LightningFeeEstimateOutput {
    __typename
    lightning_fee_estimate_output_fee_estimate_msat: fee_estimate_msat
}`;

export default LightningFeeEstimateOutput;

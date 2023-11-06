// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface LightningFeeEstimateForNodeInput {
  /** The node from where you want to send the payment. **/
  nodeId: string;

  /** The public key of the node that you want to pay. **/
  destinationNodePublicKey: string;

  /** The payment amount expressed in msats. **/
  amountMsats: number;
}

export const LightningFeeEstimateForNodeInputFromJson = (
  obj: any,
): LightningFeeEstimateForNodeInput => {
  return {
    nodeId: obj["lightning_fee_estimate_for_node_input_node_id"],
    destinationNodePublicKey:
      obj["lightning_fee_estimate_for_node_input_destination_node_public_key"],
    amountMsats: obj["lightning_fee_estimate_for_node_input_amount_msats"],
  } as LightningFeeEstimateForNodeInput;
};
export const LightningFeeEstimateForNodeInputToJson = (
  obj: LightningFeeEstimateForNodeInput,
): any => {
  return {
    lightning_fee_estimate_for_node_input_node_id: obj.nodeId,
    lightning_fee_estimate_for_node_input_destination_node_public_key:
      obj.destinationNodePublicKey,
    lightning_fee_estimate_for_node_input_amount_msats: obj.amountMsats,
  };
};

export default LightningFeeEstimateForNodeInput;

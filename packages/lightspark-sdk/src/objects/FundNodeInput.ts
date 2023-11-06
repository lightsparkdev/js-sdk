// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface FundNodeInput {
  nodeId: string;

  amountSats?: number | undefined;
}

export const FundNodeInputFromJson = (obj: any): FundNodeInput => {
  return {
    nodeId: obj["fund_node_input_node_id"],
    amountSats: obj["fund_node_input_amount_sats"],
  } as FundNodeInput;
};
export const FundNodeInputToJson = (obj: FundNodeInput): any => {
  return {
    fund_node_input_node_id: obj.nodeId,
    fund_node_input_amount_sats: obj.amountSats,
  };
};

export default FundNodeInput;

// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface FundNodeInput {
  nodeId: string;

  amountSats?: number | undefined;

  fundingAddress?: string | undefined;
}

export const FundNodeInputFromJson = (obj: any): FundNodeInput => {
  return {
    nodeId: obj["fund_node_input_node_id"],
    amountSats: obj["fund_node_input_amount_sats"],
    fundingAddress: obj["fund_node_input_funding_address"],
  } as FundNodeInput;
};
export const FundNodeInputToJson = (obj: FundNodeInput): any => {
  return {
    fund_node_input_node_id: obj.nodeId,
    fund_node_input_amount_sats: obj.amountSats,
    fund_node_input_funding_address: obj.fundingAddress,
  };
};

export default FundNodeInput;

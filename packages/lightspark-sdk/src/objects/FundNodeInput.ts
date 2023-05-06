// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type FundNodeInput = {
  nodeId: string;

  amountSats?: number;
};

export const FundNodeInputFromJson = (obj: any): FundNodeInput => {
  return {
    nodeId: obj["fund_node_input_node_id"],
    amountSats: obj["fund_node_input_amount_sats"],
  } as FundNodeInput;
};

export default FundNodeInput;

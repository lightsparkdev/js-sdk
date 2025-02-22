// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateOfferInput {
  /** The node from which to create the offer. **/
  nodeId: string;

  /**
   * The amount for which the offer should be created, in millisatoshis. Setting the amount to 0
   * will allow the payer to specify an amount.
   **/
  amountMsats?: number | undefined;

  /** A short description of the offer. **/
  description?: string | undefined;
}

export const CreateOfferInputFromJson = (obj: any): CreateOfferInput => {
  return {
    nodeId: obj["create_offer_input_node_id"],
    amountMsats: obj["create_offer_input_amount_msats"],
    description: obj["create_offer_input_description"],
  } as CreateOfferInput;
};
export const CreateOfferInputToJson = (obj: CreateOfferInput): any => {
  return {
    create_offer_input_node_id: obj.nodeId,
    create_offer_input_amount_msats: obj.amountMsats,
    create_offer_input_description: obj.description,
  };
};

export default CreateOfferInput;

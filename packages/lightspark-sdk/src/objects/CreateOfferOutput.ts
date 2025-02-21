// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface CreateOfferOutput {
  offerId: string;
}

export const CreateOfferOutputFromJson = (obj: any): CreateOfferOutput => {
  return {
    offerId: obj["create_offer_output_offer"].id,
  } as CreateOfferOutput;
};
export const CreateOfferOutputToJson = (obj: CreateOfferOutput): any => {
  return {
    create_offer_output_offer: { id: obj.offerId },
  };
};

export const FRAGMENT = `
fragment CreateOfferOutputFragment on CreateOfferOutput {
    __typename
    create_offer_output_offer: offer {
        id
    }
}`;

export default CreateOfferOutput;

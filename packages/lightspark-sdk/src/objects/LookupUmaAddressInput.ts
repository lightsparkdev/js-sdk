// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface LookupUmaAddressInput {
  umaAddress: string;
}

export const LookupUmaAddressInputFromJson = (
  obj: any,
): LookupUmaAddressInput => {
  return {
    umaAddress: obj["lookup_uma_address_input_uma_address"],
  } as LookupUmaAddressInput;
};
export const LookupUmaAddressInputToJson = (
  obj: LookupUmaAddressInput,
): any => {
  return {
    lookup_uma_address_input_uma_address: obj.umaAddress,
  };
};

export default LookupUmaAddressInput;

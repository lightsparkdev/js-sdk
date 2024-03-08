// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface MultiSigAddressValidationParameters {
  /** The counterparty funding public key used to create the 2-of-2 multisig for the address. **/
  counterpartyFundingPubkey: string;

  /**
   * The derivation path used to derive the funding public key for the 2-of-2 multisig address. *
   */
  fundingPubkeyDerivationPath: string;
}

export const MultiSigAddressValidationParametersFromJson = (
  obj: any,
): MultiSigAddressValidationParameters => {
  return {
    counterpartyFundingPubkey:
      obj[
        "multi_sig_address_validation_parameters_counterparty_funding_pubkey"
      ],
    fundingPubkeyDerivationPath:
      obj[
        "multi_sig_address_validation_parameters_funding_pubkey_derivation_path"
      ],
  } as MultiSigAddressValidationParameters;
};
export const MultiSigAddressValidationParametersToJson = (
  obj: MultiSigAddressValidationParameters,
): any => {
  return {
    multi_sig_address_validation_parameters_counterparty_funding_pubkey:
      obj.counterpartyFundingPubkey,
    multi_sig_address_validation_parameters_funding_pubkey_derivation_path:
      obj.fundingPubkeyDerivationPath,
  };
};

export const FRAGMENT = `
fragment MultiSigAddressValidationParametersFragment on MultiSigAddressValidationParameters {
    __typename
    multi_sig_address_validation_parameters_counterparty_funding_pubkey: counterparty_funding_pubkey
    multi_sig_address_validation_parameters_funding_pubkey_derivation_path: funding_pubkey_derivation_path
}`;

export default MultiSigAddressValidationParameters;

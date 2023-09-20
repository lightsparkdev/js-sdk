// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type IdAndSignature = {
  id: string;

  signature: string;
};

export const IdAndSignatureFromJson = (obj: any): IdAndSignature => {
  return {
    id: obj["id_and_signature_id"],
    signature: obj["id_and_signature_signature"],
  } as IdAndSignature;
};

export default IdAndSignature;

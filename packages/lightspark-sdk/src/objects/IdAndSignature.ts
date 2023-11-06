// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface IdAndSignature {
  /** The id of the message. **/
  id: string;

  /** The signature of the message. **/
  signature: string;
}

export const IdAndSignatureFromJson = (obj: any): IdAndSignature => {
  return {
    id: obj["id_and_signature_id"],
    signature: obj["id_and_signature_signature"],
  } as IdAndSignature;
};
export const IdAndSignatureToJson = (obj: IdAndSignature): any => {
  return {
    id_and_signature_id: obj.id,
    id_and_signature_signature: obj.signature,
  };
};

export default IdAndSignature;

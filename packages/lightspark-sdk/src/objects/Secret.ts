// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface Secret {
  encryptedValue: string;

  cipher: string;
}

export const SecretFromJson = (obj: any): Secret => {
  return {
    encryptedValue: obj["secret_encrypted_value"],
    cipher: obj["secret_cipher"],
  } as Secret;
};
export const SecretToJson = (obj: Secret): any => {
  return {
    secret_encrypted_value: obj.encryptedValue,
    secret_cipher: obj.cipher,
  };
};

export const FRAGMENT = `
fragment SecretFragment on Secret {
    __typename
    secret_encrypted_value: encrypted_value
    secret_cipher: cipher
}`;

export default Secret;

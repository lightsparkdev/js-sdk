// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

export const b64decode = (encoded: string): Uint8Array => {
  return Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
};

export const urlsafe_b64decode = (encoded: string): Uint8Array => {
  return b64decode(encoded.replace(/_/g, "/").replace(/-/g, "+"));
};

export const b64encode = (data: ArrayBuffer): string => {
  return btoa(
    String.fromCharCode.apply(null, Array.from(new Uint8Array(data)))
  );
};

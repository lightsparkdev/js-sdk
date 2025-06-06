import { KycStatus } from "@uma-sdk/core";

export type User = {
  id: string;
  umaUserName: string;
  sparkIdentityPubkey: string;
  emailAddress: string | undefined;
  name: string | undefined;
  kycStatus: KycStatus;
};

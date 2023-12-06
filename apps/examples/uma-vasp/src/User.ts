import { KycStatus } from "@uma-sdk/core";

export type User = {
    id: string;
    umaUserName: string;
    emailAddress: string | undefined;
    name: string | undefined;
    kycStatus: KycStatus;
}
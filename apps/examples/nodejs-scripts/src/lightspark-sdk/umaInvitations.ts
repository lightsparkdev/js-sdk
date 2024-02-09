// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import {
  AccountTokenAuthProvider,
  LightsparkClient,
  RegionCode,
} from "@lightsparkdev/lightspark-sdk";
import { getCredentialsFromEnvOrThrow } from "@lightsparkdev/lightspark-sdk/env";

// Let's start by creating a client
const credentials = getCredentialsFromEnvOrThrow();
const client = new LightsparkClient(
  new AccountTokenAuthProvider(
    credentials.apiTokenClientId,
    credentials.apiTokenClientSecret,
  ),
  credentials.baseUrl,
);

const invitation = await client.createUmaInvitation("bob@vasp1.com");
if (!invitation) {
  throw new Error("Unable to create invitation");
}

console.log(`Invitation: ${JSON.stringify(invitation, null, 2)}`);

const fetchedInvitation = await client.fetchUmaInvitation(invitation.code);

console.log(
  `Fetched invitation: ${JSON.stringify(fetchedInvitation, null, 2)}`,
);

const claimedInvitation = await client.claimUmaInvitation(
  invitation.code,
  "alice@vasp2.com",
);

if (!claimedInvitation) {
  throw new Error("Unable to claim invitation");
}

console.log(
  `Claimed invitation: ${JSON.stringify(claimedInvitation, null, 2)}`,
);

console.log("Starting incentive invite flow...");

const incentiveInvite = await client.createUmaInvitationWithIncentives(
  "bob@vasp1.com",
  "+13105552234",
  RegionCode.US,
);

if (!incentiveInvite) {
  throw new Error("Unable to create incentive invite");
}

console.log(`Incentive invite: ${JSON.stringify(incentiveInvite, null, 2)}`);

const claimedIncentiveInvite = await client.claimUmaInvitationWithIncentives(
  incentiveInvite.code,
  "alice@vasp2.com",
  "+13105552245",
  RegionCode.US,
);

console.log(
  `Claimed incentive invite: ${JSON.stringify(
    claimedIncentiveInvite,
    null,
    2,
  )}`,
);

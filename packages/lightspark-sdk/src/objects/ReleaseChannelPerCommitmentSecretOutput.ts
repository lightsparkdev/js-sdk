// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface ReleaseChannelPerCommitmentSecretOutput {
  /** The channel object after the per-commitment secret release operation. **/
  channelId: string;
}

export const ReleaseChannelPerCommitmentSecretOutputFromJson = (
  obj: any,
): ReleaseChannelPerCommitmentSecretOutput => {
  return {
    channelId: obj["release_channel_per_commitment_secret_output_channel"].id,
  } as ReleaseChannelPerCommitmentSecretOutput;
};
export const ReleaseChannelPerCommitmentSecretOutputToJson = (
  obj: ReleaseChannelPerCommitmentSecretOutput,
): any => {
  return {
    release_channel_per_commitment_secret_output_channel: { id: obj.channelId },
  };
};

export const FRAGMENT = `
fragment ReleaseChannelPerCommitmentSecretOutputFragment on ReleaseChannelPerCommitmentSecretOutput {
    __typename
    release_channel_per_commitment_secret_output_channel: channel {
        id
    }
}`;

export default ReleaseChannelPerCommitmentSecretOutput;

// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type ReleaseChannelPerCommitmentSecretInput = {
  channelId: string;

  perCommitmentSecret: string;

  perCommitmentIndex: number;
};

export const ReleaseChannelPerCommitmentSecretInputFromJson = (
  obj: any,
): ReleaseChannelPerCommitmentSecretInput => {
  return {
    channelId: obj["release_channel_per_commitment_secret_input_channel_id"],
    perCommitmentSecret:
      obj["release_channel_per_commitment_secret_input_per_commitment_secret"],
    perCommitmentIndex:
      obj["release_channel_per_commitment_secret_input_per_commitment_index"],
  } as ReleaseChannelPerCommitmentSecretInput;
};

export default ReleaseChannelPerCommitmentSecretInput;

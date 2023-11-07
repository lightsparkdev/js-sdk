// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface ReleaseChannelPerCommitmentSecretInput {
  /** The unique identifier of the channel. **/
  channelId: string;

  /** The per-commitment secret to be released. **/
  perCommitmentSecret: string;

  /** The index associated with the per-commitment secret. **/
  perCommitmentIndex: number;
}

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
export const ReleaseChannelPerCommitmentSecretInputToJson = (
  obj: ReleaseChannelPerCommitmentSecretInput,
): any => {
  return {
    release_channel_per_commitment_secret_input_channel_id: obj.channelId,
    release_channel_per_commitment_secret_input_per_commitment_secret:
      obj.perCommitmentSecret,
    release_channel_per_commitment_secret_input_per_commitment_index:
      obj.perCommitmentIndex,
  };
};

export default ReleaseChannelPerCommitmentSecretInput;

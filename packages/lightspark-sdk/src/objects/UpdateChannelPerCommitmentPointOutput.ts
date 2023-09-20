// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type UpdateChannelPerCommitmentPointOutput = {
  channelId: string;
};

export const UpdateChannelPerCommitmentPointOutputFromJson = (
  obj: any,
): UpdateChannelPerCommitmentPointOutput => {
  return {
    channelId: obj["update_channel_per_commitment_point_output_channel"].id,
  } as UpdateChannelPerCommitmentPointOutput;
};

export const FRAGMENT = `
fragment UpdateChannelPerCommitmentPointOutputFragment on UpdateChannelPerCommitmentPointOutput {
    __typename
    update_channel_per_commitment_point_output_channel: channel {
        id
    }
}`;

export default UpdateChannelPerCommitmentPointOutput;

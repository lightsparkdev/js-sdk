// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

type UpdateChannelPerCommitmentPointInput = {
  channelId: string;

  perCommitmentPoint: string;

  perCommitmentPointIndex: number;
};

export const UpdateChannelPerCommitmentPointInputFromJson = (
  obj: any,
): UpdateChannelPerCommitmentPointInput => {
  return {
    channelId: obj["update_channel_per_commitment_point_input_channel_id"],
    perCommitmentPoint:
      obj["update_channel_per_commitment_point_input_per_commitment_point"],
    perCommitmentPointIndex:
      obj[
        "update_channel_per_commitment_point_input_per_commitment_point_index"
      ],
  } as UpdateChannelPerCommitmentPointInput;
};

export default UpdateChannelPerCommitmentPointInput;

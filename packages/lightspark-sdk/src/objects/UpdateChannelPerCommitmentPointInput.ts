// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

interface UpdateChannelPerCommitmentPointInput {
  channelId: string;

  perCommitmentPoint: string;

  perCommitmentPointIndex: number;
}

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
export const UpdateChannelPerCommitmentPointInputToJson = (
  obj: UpdateChannelPerCommitmentPointInput,
): any => {
  return {
    update_channel_per_commitment_point_input_channel_id: obj.channelId,
    update_channel_per_commitment_point_input_per_commitment_point:
      obj.perCommitmentPoint,
    update_channel_per_commitment_point_input_per_commitment_point_index:
      obj.perCommitmentPointIndex,
  };
};

export default UpdateChannelPerCommitmentPointInput;

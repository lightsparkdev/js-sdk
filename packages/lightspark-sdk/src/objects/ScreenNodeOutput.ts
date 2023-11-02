// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import RiskRating from "./RiskRating.js";

type ScreenNodeOutput = {
  rating: RiskRating;
};

export const ScreenNodeOutputFromJson = (obj: any): ScreenNodeOutput => {
  return {
    rating:
      RiskRating[obj["screen_node_output_rating"]] ?? RiskRating.FUTURE_VALUE,
  } as ScreenNodeOutput;
};

export const FRAGMENT = `
fragment ScreenNodeOutputFragment on ScreenNodeOutput {
    __typename
    screen_node_output_rating: rating
}`;

export default ScreenNodeOutput;

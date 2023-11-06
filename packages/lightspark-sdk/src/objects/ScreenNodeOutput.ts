// Copyright ©, 2023-present, Lightspark Group, Inc. - All Rights Reserved

import RiskRating from "./RiskRating.js";

interface ScreenNodeOutput {
  rating: RiskRating;
}

export const ScreenNodeOutputFromJson = (obj: any): ScreenNodeOutput => {
  return {
    rating:
      RiskRating[obj["screen_node_output_rating"]] ?? RiskRating.FUTURE_VALUE,
  } as ScreenNodeOutput;
};
export const ScreenNodeOutputToJson = (obj: ScreenNodeOutput): any => {
  return {
    screen_node_output_rating: obj.rating,
  };
};

export const FRAGMENT = `
fragment ScreenNodeOutputFragment on ScreenNodeOutput {
    __typename
    screen_node_output_rating: rating
}`;

export default ScreenNodeOutput;

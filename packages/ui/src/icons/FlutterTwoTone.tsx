// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { useId } from "react";

export function FlutterTwoTone() {
  /**
   * unique id is required per instance to prevent interferring ids breaking
   * icon styles
   */
  const id = useId();

  return (
    <svg
      id={`logo_vector-${id}`}
      data-name="logo vector"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 371.14"
      width="100%"
      fill="none"
    >
      <polygon
        opacity="0.72"
        fill="currentColor"
        points="186.21 371.14 186 371.14 86.14 271.29 143.14 214.07 300 371.14 186.21 371.14"
      />
      <polygon
        opacity="0.72"
        fill="currentColor"
        points="186 171.21 186 171.21 85.93 271.07 143.14 328.07 300 171.21 186 171.21"
      />
      <polygon
        opacity="0.72"
        fill="currentColor"
        points="186 0.21 185.79 0 0 185.57 57.21 242.79 299.79 0.21 186 0.21"
      />
    </svg>
  );
}

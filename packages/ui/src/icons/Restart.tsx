// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Restart({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.5 7.96429C1.28571 9.53571 2.85714 11.5 6 11.5C9.14286 11.5 10.7143 9.53571 11.5 7.96429M11.5 7.96429H8.75M11.5 7.96429V11.1071M11.5 4.03571C10.7143 2.46429 9.14286 0.5 6 0.5C2.85714 0.5 1.28571 2.46429 0.5 4.03571M0.5 4.03571H3.25M0.5 4.03571V0.892857"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

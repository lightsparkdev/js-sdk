// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function PaperPlaneRounder({
  strokeWidth = "2.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 41 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.0184 22.5845L22.9681 17.6348M18.0184 22.5845L1.92621 15.1574C1.10355 14.7777 1.1695 13.5872 2.02904 13.3007L38.0413 1.29672C38.8229 1.03608 39.5667 1.77982 39.3062 2.5616L27.3022 38.5739C27.0156 39.4334 25.8252 39.4993 25.4455 38.6766L18.0184 22.5845Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

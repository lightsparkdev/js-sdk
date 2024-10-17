// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Globus({
  strokeWidth = "2",
  strokeLinecap = "square",
}: PathProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21M21 12C21 7.02944 16.9706 3 12 3M21 12H3M12 21C7.02944 21 3 16.9706 3 12M12 21C9.79086 21 8 16.9706 8 12C8 7.02944 9.79086 3 12 3M12 21C14.2091 21 16 16.9706 16 12C16 7.02944 14.2091 3 12 3M12 3C7.02944 3 3 7.02944 3 12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}

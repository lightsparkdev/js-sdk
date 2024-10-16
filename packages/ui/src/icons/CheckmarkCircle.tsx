// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { invertStrokeColor } from "./constants.js";
import { type PathProps } from "./types.js";

export function CheckmarkCircle({
  strokeWidth = "2",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 32 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect y="0.5" width="32" height="32" rx="16" fill="currentColor" />
      <path
        d="M8 16.4995L13 21.4995L24 10.4995"
        className={invertStrokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Satoshi({
  strokeWidth = "3.71429",
  strokeLinecap = "butt",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 26 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 11.2142H26"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
      <path
        d="M13 5.64284V0.0714111"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
      <path
        d="M13 40.9286V35.3572"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
      <path
        d="M0 20.5H26"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
      <path
        d="M0 29.7858H26"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}

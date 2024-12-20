// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Contrast({
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M10.5 6C10.5 8.4853 8.4853 10.5 6 10.5C3.51472 10.5 1.5 8.4853 1.5 6C1.5 3.51472 3.51472 1.5 6 1.5C8.4853 1.5 10.5 3.51472 10.5 6Z"
        stroke="currentColor"
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M6 1.75V10.25"
        stroke="currentColor"
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M7.5 2V10"
        stroke="currentColor"
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M9 2.75V9.25"
        stroke="currentColor"
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Eye({
  strokeWidth = "1.5",
  strokeLinecap = "butt",
  strokeLinejoin = "miter",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.0714 8.17857C10.0714 9.32259 9.14402 10.25 8 10.25C6.85598 10.25 5.92857 9.32259 5.92857 8.17857C5.92857 7.03455 6.85598 6.10714 8 6.10714C9.14402 6.10714 10.0714 7.03455 10.0714 8.17857Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M8 3C4.375 3 0.75 5.82468 0.75 8.17857C0.75 10.5325 4.375 13.3571 8 13.3571C11.625 13.3571 15.25 10.5325 15.25 8.17857C15.25 5.82468 11.625 3 8 3Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function ExclamationPoint({
  strokeWidth = "1.25",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.48828 6.5C1.48828 3.46243 3.95072 0.999999 6.98828 1C10.0258 1 12.4883 3.46243 12.4883 6.5C12.4883 9.53757 10.0258 12 6.98828 12C3.95072 12 1.48828 9.53757 1.48828 6.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M6.98828 4.14286L6.98828 6.5M6.98828 8.85707L6.98828 8.87549"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M6.98828 8.85707L6.98828 8.87549"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

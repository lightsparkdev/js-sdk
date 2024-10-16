// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Plus({
  strokeWidth = "1.5",
  strokeLinecap = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.875 7.17828H7.1783V1.87498"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
      <path
        d="M7.33203 1.875V7.1783H12.6353"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
      <path
        d="M12.6367 7.33859H7.33342V12.6419"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
      <path
        d="M7.17969 12.643L7.17969 7.33969L1.87639 7.33969"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}

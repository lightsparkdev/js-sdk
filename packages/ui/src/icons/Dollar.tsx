// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Dollar({
  strokeWidth = "1.125",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 10 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.90922 2.61607H5.00156M5.00156 2.61607H3.57422C2.26039 2.61607 1.19531 3.48552 1.19531 4.55804C1.19531 5.63055 2.26039 6.5 3.57422 6.5H5.00156M5.00156 2.61607V1.0625M5.00156 2.61607V6.5M5.00156 6.5H6.42891C7.74274 6.5 8.80781 7.36945 8.80781 8.44196C8.80781 9.51448 7.74274 10.3839 6.42891 10.3839H5.00156M5.00156 6.5V10.3839M5.00156 10.3839H1.61833M5.00156 10.3839V11.9375"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

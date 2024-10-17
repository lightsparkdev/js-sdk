// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function SecurityKey({ strokeWidth = "1.125" }: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.5625"
        y="3.3125"
        width="8.25"
        height="6.375"
        rx="0.9375"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M8.8125 4.8125H10.5C11.0178 4.8125 11.4375 5.23223 11.4375 5.75V7.25C11.4375 7.76777 11.0178 8.1875 10.5 8.1875H8.8125V4.8125Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <rect
        x="3.75"
        y="5.75"
        width="2.25"
        height="1.5"
        rx="0.75"
        fill="currentColor"
      />
    </svg>
  );
}

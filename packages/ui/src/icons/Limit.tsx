// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Limit({
  strokeWidth = "2",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M9.99883 10.8335L7.49887 8.3335M4.40956 15.8335C1.77112 12.8887 1.86683 8.36008 4.6967 5.5302C7.62563 2.60126 12.3743 2.60126 15.3033 5.5302C18.1332 8.36008 18.2289 12.8887 15.5904 15.8335"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

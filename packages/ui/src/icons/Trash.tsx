// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Trash({
  strokeWidth = "1",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.5 2.85714H11.5M4.07143 11.5H7.92857C8.79647 11.5 9.5 10.7965 9.5 9.92857L9.92857 2.07143C9.92857 1.20355 9.22504 0.5 8.35714 0.5H3.64286C2.77498 0.5 2.07143 1.20355 2.07143 2.07143L2.5 9.92857C2.5 10.7965 3.20355 11.5 4.07143 11.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M5 5V9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
      <path
        d="M7 5V9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}

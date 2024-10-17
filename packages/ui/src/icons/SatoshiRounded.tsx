// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function SatoshiRounded({
  strokeWidth = "1.5",
  strokeLinecap = "round",
}: PathProps) {
  return (
    <svg
      viewBox="0 0 12 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
    >
      <path
        d="M10.4 4.77783H1.09985"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        stroke="currentColor"
      />
      <path
        d="M10.4 8H1.09985"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        stroke="currentColor"
      />
      <path
        d="M10.4 11.2222H1.09985"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        stroke="currentColor"
      />
      <path
        d="M5.95215 15.2498L5.95215 13.6387"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        stroke="currentColor"
      />
      <path
        d="M5.95215 2.36111L5.95215 0.75"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        stroke="currentColor"
      />
    </svg>
  );
}

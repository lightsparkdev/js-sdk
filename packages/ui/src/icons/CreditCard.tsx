// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function CreditCard({
  strokeWidth = "1.125",
  strokeLinecap = "butt",
  strokeLinejoin = "miter",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.25 5.9375H9.375" stroke="currentColor" strokeWidth="1.125" />
      <rect
        x="1.5"
        y="2.9375"
        width="9"
        height="7.125"
        rx="1"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        mask="url(#path-1-inside-1_865_26901)"
      />
    </svg>
  );
}

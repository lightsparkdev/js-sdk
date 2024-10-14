// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import {
  type PathLinecap,
  type PathLinejoin,
  type PathStrokeWidth,
} from "./types.js";

type CopyProps = {
  strokeWidth?: PathStrokeWidth;
  strokeLinecap?: PathLinecap;
  strokeLinejoin?: PathLinejoin;
};

export function Copy({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: CopyProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.25 6.75V1.25C13.25 0.97386 13.0261 0.75 12.75 0.75H1.25C0.97386 0.75 0.75 0.97386 0.75 1.25V12.75C0.75 13.0261 0.97386 13.25 1.25 13.25H6.75M7.25 6.75H18.75C19.0261 6.75 19.25 6.97386 19.25 7.25V18.75C19.25 19.0261 19.0261 19.25 18.75 19.25H7.25C6.97386 19.25 6.75 19.0261 6.75 18.75V7.25C6.75 6.97386 6.97386 6.75 7.25 6.75Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Search({
  strokeWidth = "2",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.9972 10.9512C9.78136 12.1281 8.12781 12.6667 6.83333 12.6667C4.5 12.6667 1 10.9167 1 6.83333C1 2.75 4.5 1 6.83333 1C9.16667 1 12.6667 2.75 12.6667 6.83333C12.6667 8.65133 11.9729 10.0068 10.9972 10.9512ZM10.9972 10.9512L15 15"
        stroke="#404040"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

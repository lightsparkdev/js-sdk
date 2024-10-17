// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function FramedLetterI({
  strokeWidth = "1",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.8999 1.5H2.8999C2.34762 1.5 1.8999 1.94772 1.8999 2.5V9.5C1.8999 10.0523 2.34762 10.5 2.8999 10.5H9.8999C10.4522 10.5 10.8999 10.0523 10.8999 9.5V2.5C10.8999 1.94772 10.4522 1.5 9.8999 1.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M6.3999 4V8"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

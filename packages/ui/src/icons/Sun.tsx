// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Sun({
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.76775 4.23224C8.7441 5.20855 8.7441 6.79145 7.76775 7.76775C6.79145 8.7441 5.20855 8.7441 4.23224 7.76775C3.25592 6.79145 3.25592 5.20855 4.23224 4.23224C5.20855 3.25592 6.79145 3.25592 7.76775 4.23224Z"
        stroke="currentColor"
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M6 1.5V1M6 11V10.5M9.1799 2.82002L9.5349 2.46502M2.46508 9.535L2.82008 9.18M10.5 6H11M1 6H1.5M9.1799 9.18L9.5349 9.535M2.46508 2.46502L2.82008 2.82002"
        stroke="currentColor"
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Lock2({ strokeWidth = "1.4" }: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      opacity={0.9}
    >
      <path
        d="M8.125 4.875V3.625C8.125 2.4514 7.1736 1.5 6 1.5C4.8264 1.5 3.875 2.4514 3.875 3.625V4.875M6 7V8.5M2.875 10.625H9.125C9.40115 10.625 9.625 10.4011 9.625 10.125V5.375C9.625 5.09885 9.40115 4.875 9.125 4.875H2.875C2.59886 4.875 2.375 5.09885 2.375 5.375V10.125C2.375 10.4011 2.59885 10.625 2.875 10.625Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

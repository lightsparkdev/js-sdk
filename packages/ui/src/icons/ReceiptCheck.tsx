// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function ReceiptCheck({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.75 14.75H15.25M9.875 9.50001L11.4583 11.0834L14.625 7.91669M5.75 2.75H18.25C18.8023 2.75 19.25 3.19772 19.25 3.75V21.25L16.6667 19L14.3333 21.25L12 19L9.66667 21.25L7.33333 19L4.75 21.25V3.75C4.75 3.19772 5.19772 2.75 5.75 2.75Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

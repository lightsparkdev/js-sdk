// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function ZapLite({
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
        d="M19.7977 8.74998H13.7499C13.4738 8.74998 13.2499 8.52612 13.2499 8.24998V2.35568C13.2499 1.86503 12.6168 1.6679 12.3383 2.07181L3.79055 14.4661C3.5618 14.7978 3.79923 15.25 4.20215 15.25H10.2499C10.526 15.25 10.7499 15.4739 10.7499 15.75V21.6443C10.7499 22.135 11.3829 22.3321 11.6615 21.9282L20.2093 9.53385C20.4381 9.20216 20.2006 8.74998 19.7977 8.74998Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

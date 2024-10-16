// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Remove({
  strokeWidth = "1.5",
  strokeLinecap = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.0203 5.72973L6.47973 10.2703M11.0203 10.2703L6.47973 5.72973M15.75 8C15.75 11.866 12.616 15 8.75 15C4.88401 15 1.75 11.866 1.75 8C1.75 4.13401 4.88401 1 8.75 1C12.616 1 15.75 4.13401 15.75 8Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}

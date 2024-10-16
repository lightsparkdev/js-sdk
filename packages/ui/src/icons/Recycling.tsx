// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Recycling({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 9.9987V4.66536C12 3.92898 11.4031 3.33203 10.6667 3.33203H7M12 9.9987L10 7.9987M12 9.9987L14 7.9987M4 5.9987V11.332C4 12.0684 4.59695 12.6654 5.33333 12.6654H9M4 5.9987L6 7.9987M4 5.9987L2 7.9987"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

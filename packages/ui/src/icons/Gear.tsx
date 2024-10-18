// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Gear({
  strokeWidth = "1.5",
  strokeLinecap = "butt",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.6849 3.60254L4.17969 3.02441L3.02344 4.18066L3.60156 6.68587L1.28906 8.22754V9.76921L3.60156 11.3109L3.02344 13.816L4.17969 14.9723L6.6849 14.3942L8.22656 16.7067H9.76823L11.3099 14.3942L13.8151 14.9723L14.9713 13.816L14.3932 11.3109L16.7057 9.76921V8.22754L14.3932 6.68587L14.9713 4.18066L13.8151 3.02441L11.3099 3.60254L9.76823 1.29004H8.22656L6.6849 3.60254Z"
        stroke="black"
        strokeWidth={strokeWidth}
        strokeLinejoin={strokeLinejoin}
        strokeLinecap={strokeLinecap}
      />
      <path
        d="M11.2904 8.9987C11.2904 10.2644 10.2644 11.2904 8.9987 11.2904C7.73303 11.2904 6.70703 10.2644 6.70703 8.9987C6.70703 7.73303 7.73303 6.70703 8.9987 6.70703C10.2644 6.70703 11.2904 7.73303 11.2904 8.9987Z"
        stroke="black"
        strokeWidth={strokeWidth}
        strokeLinejoin={strokeLinejoin}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}

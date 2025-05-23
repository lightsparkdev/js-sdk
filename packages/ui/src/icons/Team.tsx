// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Team({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.7498 19.25H21.4228C22.0042 19.25 22.468 18.754 22.3704 18.1808C21.8389 15.0624 20.0189 12.75 16.9998 12.75C16.5537 12.75 16.1338 12.8005 15.7404 12.8966M11.2497 7C11.2497 8.79493 9.79461 10.25 7.99969 10.25C6.20476 10.25 4.74969 8.79493 4.74969 7C4.74969 5.20507 6.20476 3.75 7.99969 3.75C9.79461 3.75 11.2497 5.20507 11.2497 7ZM19.7497 7.5C19.7497 9.01878 18.5185 10.25 16.9997 10.25C15.4809 10.25 14.2497 9.01878 14.2497 7.5C14.2497 5.98122 15.4809 4.75 16.9997 4.75C18.5185 4.75 19.7497 5.98122 19.7497 7.5ZM1.87029 19.1808C2.4382 15.4997 4.51686 12.75 7.99969 12.75C11.4825 12.75 13.5612 15.4997 14.1291 19.1808C14.2177 19.755 13.7549 20.25 13.1739 20.25H2.82547C2.24447 20.25 1.7817 19.755 1.87029 19.1808Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

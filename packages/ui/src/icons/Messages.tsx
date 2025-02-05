// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Messages({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="25"
      height="26"
      viewBox="0 0 25 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_450_127605)">
        <rect
          y="0.5"
          width="25"
          height="25"
          rx="6"
          fill="url(#paint0_linear_450_127605)"
        />
        <path
          d="M12 19.3403C16.8325 19.3403 20.75 16.0541 20.75 12.0002C20.75 7.94643 16.8325 4.66016 12 4.66016C7.16751 4.66016 3.25 7.94643 3.25 12.0002C3.25 14.5483 4.79777 16.7932 7.14767 18.1092C7.36308 18.2299 7.47351 18.485 7.37294 18.7105C7.13218 19.2502 6.77538 19.7628 6.41797 20.1965C7.1441 20.1965 8.08445 19.962 9.11587 19.1551C9.24522 19.0539 9.41368 19.0158 9.57331 19.0544C10.3438 19.2406 11.158 19.3403 12 19.3403Z"
          fill="white"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_450_127605"
          x1="12.501"
          y1="25.5019"
          x2="12.501"
          y2="0.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0ABC28" />
          <stop offset="1" stopColor="#5DF877" />
        </linearGradient>
        <clipPath id="clip0_450_127605">
          <rect y="0.5" width="25" height="25" rx="6" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

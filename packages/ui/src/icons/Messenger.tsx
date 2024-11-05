// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Messenger({
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
      <g clipPath="url(#clip0_450_127598)">
        <rect y="0.5" width="25" height="25" rx="6" fill="white" />
        <g clipPath="url(#clip1_450_127598)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 3.35938C6.71878 3.35938 2.625 7.22787 2.625 12.4531C2.625 15.1863 3.74513 17.548 5.56928 19.1793C5.72241 19.3164 5.81484 19.5084 5.82112 19.7139L5.87218 21.3815C5.88849 21.9134 6.43794 22.2596 6.92469 22.0447L8.7855 21.2233C8.94324 21.1537 9.12 21.1408 9.28622 21.1865C10.1413 21.4216 11.0514 21.5469 12 21.5469C17.2812 21.5469 21.375 17.6784 21.375 12.4531C21.375 7.22787 17.2812 3.35938 12 3.35938Z"
            fill="url(#paint0_radial_450_127598)"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.37047 15.1125L9.12438 10.7434C9.56243 10.0483 10.5005 9.87523 11.1578 10.3682L13.3481 12.0109C13.5491 12.1617 13.8256 12.1609 14.0257 12.009L16.9838 9.76395C17.3787 9.46433 17.894 9.93683 17.6298 10.3561L14.8759 14.7253C14.4378 15.4203 13.4997 15.5934 12.8425 15.1004L10.6521 13.4577C10.4512 13.307 10.1747 13.3078 9.97456 13.4596L7.01641 15.7047C6.62159 16.0043 6.10619 15.5318 6.37047 15.1125Z"
            fill="white"
          />
        </g>
      </g>
      <rect
        x="0.25"
        y="0.75"
        width="24.5"
        height="24.5"
        rx="5.75"
        stroke="black"
        strokeOpacity="0.1"
        strokeWidth="0.5"
      />
      <defs>
        <radialGradient
          id="paint0_radial_450_127598"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(6.24 22.1) rotate(-59.4208) scale(20.4431 20.4431)"
        >
          <stop stopColor="#0099FF" />
          <stop offset="0.609754" stopColor="#A033FF" />
          <stop offset="0.934823" stopColor="#FF5280" />
          <stop offset="1" stopColor="#FF7061" />
        </radialGradient>
        <clipPath id="clip0_450_127598">
          <rect y="0.5" width="25" height="25" rx="6" fill="white" />
        </clipPath>
        <clipPath id="clip1_450_127598">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="translate(0 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

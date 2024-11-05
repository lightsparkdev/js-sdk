// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function WhatsApp({
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
      <g clipPath="url(#clip0_450_127592)">
        <rect
          y="0.5"
          width="25"
          height="25"
          rx="6"
          fill="url(#paint0_linear_450_127592)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.8999 6.59051C17.2697 4.96733 15.1003 4.07108 12.7899 4.07108C8.028 4.07108 4.15792 7.9287 4.15377 12.6661C4.15377 14.1819 4.55198 15.6605 5.30691 16.9615L4.08325 21.418L8.66264 20.2244C9.92364 20.91 11.3423 21.2693 12.7899 21.2693H12.7941C17.5518 21.2693 21.426 17.4117 21.4302 12.6743C21.4302 10.3738 20.5301 8.21369 18.8999 6.59051ZM12.7941 19.8155C11.504 19.8155 10.2389 19.4685 9.13966 18.8201L8.87834 18.6673L6.1614 19.3777L6.8873 16.7426L6.71723 16.4741C5.99963 15.3383 5.61801 14.0208 5.61801 12.6702C5.61801 8.72997 8.84101 5.52491 12.7982 5.52491C14.7146 5.52491 16.519 6.26835 17.8712 7.61894C19.2276 8.96952 19.9742 10.7662 19.9701 12.6743C19.9659 16.6104 16.7471 19.8155 12.7941 19.8155ZM16.7305 14.4668C16.5148 14.3595 15.4529 13.8391 15.258 13.7688C15.0589 13.6986 14.9178 13.6615 14.7726 13.8762C14.6275 14.091 14.2168 14.5742 14.0882 14.7188C13.9638 14.8633 13.8352 14.8799 13.6195 14.7725C13.4038 14.6651 12.7069 14.4379 11.8856 13.7069C11.2427 13.1369 10.8113 12.4348 10.6869 12.22C10.5624 12.0052 10.6744 11.8896 10.7823 11.7822C10.8777 11.6872 10.998 11.5303 11.1058 11.4064C11.2137 11.2824 11.251 11.1916 11.3215 11.047C11.392 10.9025 11.3588 10.7786 11.3049 10.6712C11.251 10.5638 10.8196 9.50645 10.6412 9.07691C10.467 8.65975 10.2887 8.71345 10.1559 8.70932C10.0315 8.70106 9.8863 8.70106 9.74112 8.70106C9.59594 8.70106 9.36366 8.75475 9.16455 8.96952C8.96545 9.18429 8.40962 9.7047 8.40962 10.762C8.40962 11.8194 9.18114 12.8395 9.28899 12.9841C9.39684 13.1287 10.8113 15.297 12.9766 16.2263C13.4909 16.4494 13.8933 16.5815 14.2085 16.6806C14.727 16.8459 15.1957 16.8211 15.5691 16.7674C15.9839 16.7054 16.8466 16.247 17.025 15.7472C17.2034 15.2475 17.2034 14.8138 17.1495 14.7271C17.0872 14.6279 16.9462 14.5742 16.7305 14.4668Z"
          fill="white"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_450_127592"
          x1="12.501"
          y1="25.5019"
          x2="12.501"
          y2="0.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#25CF43" />
          <stop offset="1" stopColor="#61FD7D" />
        </linearGradient>
        <clipPath id="clip0_450_127592">
          <rect y="0.5" width="25" height="25" rx="6" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

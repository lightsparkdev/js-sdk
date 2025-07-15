// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import { type PathProps } from "../types.js";

export function ShieldCheckLite({
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
        d="M9.25 11.4999L11 13.2499L14.75 9.49986M20.25 11.9122V6.22062C20.25 5.79019 19.9746 5.40805 19.5662 5.27194L12.3162 2.85527C12.111 2.78685 11.889 2.78685 11.6838 2.85527L4.43377 5.27194C4.02543 5.40805 3.75 5.79019 3.75 6.22062V11.9122C3.75 16.8847 8 19.2499 12 21.4078C16 19.2499 20.25 16.8847 20.25 11.9122Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

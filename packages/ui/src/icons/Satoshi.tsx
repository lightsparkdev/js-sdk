// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

type SatoshiProps = PathProps & { square?: boolean };

export function Satoshi({
  strokeWidth = "3.71429",
  strokeLinecap = "butt",
  square = false,
}: SatoshiProps) {
  const viewBox = square ? "0 0 41 41" : "0 0 26 41";
  const transform = square ? "translate(7.5,0)" : undefined;

  return (
    <svg
      width="100%"
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform={transform}>
        <path
          d="M0 11.2142H26"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
        />
        <path
          d="M13 5.64284V0.0714111"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
        />
        <path
          d="M13 40.9286V35.3572"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
        />
        <path
          d="M0 20.5H26"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
        />
        <path
          d="M0 29.7858H26"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
        />
      </g>
    </svg>
  );
}

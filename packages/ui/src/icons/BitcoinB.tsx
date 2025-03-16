// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

type BitcoinBProps = PathProps & { square?: boolean };

export function BitcoinB({
  strokeWidth = "1.125",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  square = false,
}: BitcoinBProps) {
  const viewBox = square ? "0 0 13 13" : "0 0 9 13";
  const transform = square ? "translate(2,0)" : "";

  return (
    <svg
      width="100%"
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={transform}>
        <path
          d="M2.52899 2.51568H1M2.52899 2.51568V6.30488M2.52899 2.51568H3.12195M2.52899 6.30488H6.25472M2.52899 6.30488V10.0941M6.25472 6.30488C7.61193 6.30488 8.42683 7.15312 8.42683 8.19948C8.42683 9.24584 7.61193 10.0941 6.25472 10.0941M6.25472 6.30488C7.61193 6.30488 8.42683 5.45664 8.42683 4.41028C8.42683 3.36392 7.61193 2.51568 6.25472 2.51568M6.25472 10.0941V11.875M6.25472 10.0941H3.12195M2.52899 10.0941H1M2.52899 10.0941H3.12195M6.25472 2.51568V1M6.25472 2.51568H3.12195M3.12195 1V2.51568M3.12195 10.0941V11.875"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
          strokeLinejoin={strokeLinejoin}
        />
      </g>
    </svg>
  );
}

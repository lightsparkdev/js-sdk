// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function WarningSign({
  strokeWidth = "2",
  strokeLinecap = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="triangle-exclamation">
        <path
          id="Vector"
          d="M11.9971 10.0156V12.0121M12 15H12.01M11.1354 3.49213L2.88661 17.4956C2.4946 18.1611 2.9751 19 3.74825 19H20.2459C21.019 19 21.4995 18.1611 21.1075 17.4956L12.8587 3.49213C12.4722 2.83596 11.5219 2.83596 11.1354 3.49213ZM12.25 15C12.25 15.1381 12.1381 15.25 12 15.25C11.8619 15.25 11.75 15.1381 11.75 15C11.75 14.8619 11.8619 14.75 12 14.75C12.1381 14.75 12.25 14.8619 12.25 15Z"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
        />
      </g>
    </svg>
  );
}

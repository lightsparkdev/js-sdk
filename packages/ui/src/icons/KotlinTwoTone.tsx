// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { useTheme } from "@emotion/react";
import { nanoid } from "nanoid";
import { useRef } from "react";

function KotlinTwoTone() {
  /**
   * unique id is required per instance to prevent interferring ids breaking
   * icon styles
   */
  const idRef = useRef(nanoid());
  const id = idRef.current;
  const theme = useTheme();

  return (
    <svg
      width="100%"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath={`url(#clip0_286_537-${id})`}>
        <path
          d="M24.333 24H0.333008V0H24.333L12.333 12L24.333 24Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id={`clip0_286_537-${id}`}>
          <rect
            width="24"
            height="24"
            fill={theme.bg}
            transform="translate(0.333008)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export default KotlinTwoTone;

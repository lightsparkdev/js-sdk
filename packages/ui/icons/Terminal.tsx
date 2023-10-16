// Copyright  ©, 2023, Lightspark Group, Inc. - All Rights Reserved

import { useTheme } from "@emotion/react";

function Terminal() {
  const theme = useTheme();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
    >
      <path
        d="M7.33337 23.3333L14.6667 16L7.33337 8.66663M16.6667 26H26"
        stroke={theme.content.text}
        strokeWidth="2.28571"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Terminal;

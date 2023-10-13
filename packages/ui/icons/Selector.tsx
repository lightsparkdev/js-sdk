// Copyright  ©, 2023, Lightspark Group, Inc. - All Rights Reserved

import { useTheme } from "@emotion/react";

function Selector() {
  const theme = useTheme();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M4 5.33331L8 1.33331L12 5.33331"
        stroke={theme.controls.text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 10.6667L8 14.6667L12 10.6667"
        stroke={theme.controls.text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Selector;

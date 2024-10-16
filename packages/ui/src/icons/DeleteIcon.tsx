// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import { useTheme } from "@emotion/react";
import { type PathProps } from "./types.js";

export function DeleteIcon({
  strokeWidth = "1.33333",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  const theme = useTheme();
  return (
    <svg
      width="100%"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="16" height="16" rx="8" fill="currentColor" />
      <path
        d="M5.3335 5.33337L10.6668 10.6667"
        stroke={theme.bg}
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M5.3335 10.6666L10.6668 5.33329"
        stroke={theme.bg}
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

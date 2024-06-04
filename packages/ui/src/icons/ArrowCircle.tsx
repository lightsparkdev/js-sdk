// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { invertStrokeColor } from "./constants.js";

export function ArrowCircle() {
  return (
    <svg
      width="100%"
      viewBox="0 0 31 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="15" cy="15" r="15" fill="currentColor" />
      <path
        className={invertStrokeColor}
        d="M21 18V9M21 9H12M21 9L9.5 20.5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

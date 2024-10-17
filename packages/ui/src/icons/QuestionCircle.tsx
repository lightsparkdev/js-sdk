// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function QuestionCircle({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.75 7.25C8.5 5 12.25 5.19156 12.25 7.54132C12.25 9.2008 10 9.4614 10 11.25M10 14V13.99M19.25 10C19.25 15.1086 15.1086 19.25 10 19.25C4.89137 19.25 0.75 15.1086 0.75 10C0.75 4.89137 4.89137 0.75 10 0.75C15.1086 0.75 19.25 4.89137 19.25 10ZM10.25 14C10.25 14.1381 10.1381 14.25 10 14.25C9.8619 14.25 9.75 14.1381 9.75 14C9.75 13.8619 9.8619 13.75 10 13.75C10.1381 13.75 10.25 13.8619 10.25 14Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

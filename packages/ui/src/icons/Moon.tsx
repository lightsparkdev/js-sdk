// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Moon({
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.4819 5.38385C8.91805 5.77245 8.23465 6 7.49805 6C5.56505 6 3.99804 4.433 3.99804 2.5C3.99804 1.76346 4.22555 1.08006 4.61415 0.516235C2.30956 0.71151 0.5 2.64396 0.5 4.99905C0.5 7.48385 2.5143 9.49815 4.99905 9.49815C7.3542 9.49815 9.2867 7.6885 9.4819 5.38385Z"
        stroke="currentColor"
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function Download({
  strokeWidth = "1",
  strokeLinecap = "butt",
  strokeLinejoin = "miter",
}: PathProps) {
  return (
    <svg
      width="100%"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.75 14C4.16421 14 4.5 14.3358 4.5 14.75V19.5H19.5V14.75C19.5 14.3358 19.8358 14 20.25 14C20.6642 14 21 14.3358 21 14.75V20.25C21 20.6642 20.6642 21 20.25 21H3.75C3.33579 21 3 20.6642 3 20.25V14.75C3 14.3358 3.33579 14 3.75 14Z"
        fill="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 15.75C12.1989 15.75 12.3897 15.671 12.5303 15.5303L16.0303 12.0303C16.3232 11.7374 16.3232 11.2626 16.0303 10.9697C15.7374 10.6768 15.2626 10.6768 14.9697 10.9697L12.75 13.1893V3.75C12.75 3.33579 12.4142 3 12 3C11.5858 3 11.25 3.33579 11.25 3.75V13.1893L9.03033 10.9697C8.73744 10.6768 8.26256 10.6768 7.96967 10.9697C7.67678 11.2626 7.67678 11.7374 7.96967 12.0303L11.4697 15.5303C11.6103 15.671 11.8011 15.75 12 15.75Z"
        fill="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

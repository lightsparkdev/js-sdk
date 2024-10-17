// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function LinkIcon({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M7.70833 3.125H4.45833C3.99162 3.125 3.75827 3.125 3.58001 3.21582C3.42321 3.29572 3.29572 3.42321 3.21582 3.58001C3.125 3.75827 3.125 3.99162 3.125 4.45833V15.5417C3.125 16.0084 3.125 16.2418 3.21582 16.42C3.29572 16.5768 3.42321 16.7043 3.58001 16.7842C3.75827 16.875 3.99162 16.875 4.45833 16.875H15.5417C16.0084 16.875 16.2418 16.875 16.42 16.7842C16.5768 16.7043 16.7043 16.5768 16.7842 16.42C16.875 16.2418 16.875 16.0084 16.875 15.5417V12.2917M11.4583 3.125H16.875M16.875 3.125V8.54167M16.875 3.125L9.16667 10.8333"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M7.70833 3.125H4.45833C3.99162 3.125 3.75827 3.125 3.58001 3.21582C3.42321 3.29572 3.29572 3.42321 3.21582 3.58001C3.125 3.75827 3.125 3.99162 3.125 4.45833V15.5417C3.125 16.0084 3.125 16.2418 3.21582 16.42C3.29572 16.5768 3.42321 16.7043 3.58001 16.7842C3.75827 16.875 3.99162 16.875 4.45833 16.875H15.5417C16.0084 16.875 16.2418 16.875 16.42 16.7842C16.5768 16.7043 16.7043 16.5768 16.7842 16.42C16.875 16.2418 16.875 16.0084 16.875 15.5417V12.2917M11.4583 3.125H16.875M16.875 3.125V8.54167M16.875 3.125L9.16667 10.8333"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { useTheme } from "@emotion/react";
import { nanoid } from "nanoid";
import { useRef } from "react";

export function ReactTwoTone() {
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
      viewBox="0 0 24 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath={`url(#clip0_286_456-${id})`}>
        <path
          d="M12.0005 12.8165C13.1819 12.8165 14.1396 11.8587 14.1396 10.6773C14.1396 9.49593 13.1819 8.53821 12.0005 8.53821C10.819 8.53821 9.86133 9.49593 9.86133 10.6773C9.86133 11.8587 10.819 12.8165 12.0005 12.8165Z"
          fill="currentColor"
        />
        <path
          d="M11.9997 15.0604C18.339 15.0604 23.478 13.0982 23.478 10.6778C23.478 8.25733 18.339 6.29517 11.9997 6.29517C5.66048 6.29517 0.521484 8.25733 0.521484 10.6778C0.521484 13.0982 5.66048 15.0604 11.9997 15.0604Z"
          stroke="currentColor"
          strokeWidth="1.04348"
        />
        <path
          d="M8.20389 12.8681C11.3735 18.3581 15.6423 21.8275 17.7385 20.6173C19.8346 19.4071 18.9644 13.9755 15.7948 8.48551C12.6252 2.99554 8.35638 -0.473876 6.26021 0.736348C4.16404 1.94657 5.03426 7.37815 8.20389 12.8681Z"
          stroke="currentColor"
          strokeWidth="1.04348"
        />
        <path
          d="M8.20415 8.48669C5.03451 13.9767 4.1643 19.4082 6.26047 20.6185C8.35664 21.8287 12.6254 18.3593 15.795 12.8693C18.9647 7.37933 19.8349 1.94775 17.7387 0.737529C15.6426 -0.472695 11.3738 2.99672 8.20415 8.48669Z"
          stroke="currentColor"
          strokeWidth="1.04348"
        />
      </g>
      <defs>
        <clipPath id={`clip0_286_456-${id}`}>
          <rect width="24" height="21.3532" fill={theme.bg} />
        </clipPath>
      </defs>
    </svg>
  );
}

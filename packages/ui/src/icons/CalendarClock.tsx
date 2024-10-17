// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { type PathProps } from "./types.js";

export function CalendarClock({
  strokeWidth = "2",
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
        d="M7.08337 16.6667H4.16671C3.70647 16.6667 3.33337 16.2936 3.33337 15.8333V5C3.33337 4.53977 3.70647 4.16667 4.16671 4.16667H15.8334C16.2936 4.16667 16.6667 4.53977 16.6667 5V7.08333M6.66671 4.16667V2.5M13.3334 4.16667V2.5M14.1667 12.5002V14.1666L15.4167 15.4168M12.5728 10.3182C14.6985 9.43767 17.1346 10.4473 18.0152 12.573C18.8957 14.6986 17.886 17.1346 15.7603 18.0152C13.6346 18.8957 11.1985 17.886 10.318 15.7603C9.43812 13.6354 10.4471 11.1987 12.5728 10.3182Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

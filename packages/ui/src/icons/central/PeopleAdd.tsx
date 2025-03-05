import { type PathProps } from "../types.js";

export function PeopleAdd({
  strokeWidth = "1.5",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.8509 13.2513C8.13115 13.3158 5.42253 15.8176 4.67009 19.1657C4.54089 19.7406 5.0077 20.25 5.59696 20.25H12.4985M11.8509 13.2513C11.8999 13.2504 11.9491 13.25 11.9985 13.25C12.3506 13.25 12.6939 13.2717 13.0275 13.3138M11.8509 13.2513C11.2008 13.2626 10.5819 13.3483 9.99864 13.5M13.0275 13.3138C13.3612 13.3559 13.6853 13.4184 13.9989 13.5M13.0275 13.3138C13.7295 13.4024 14.3889 13.5812 14.9985 13.838M18.2485 15.25V18.25M18.2485 18.25V21.25M18.2485 18.25H15.2485M18.2485 18.25H21.2485M15.7485 6.5C15.7485 8.57107 14.0696 10.25 11.9985 10.25C9.92747 10.25 8.24854 8.57107 8.24854 6.5C8.24854 4.42893 9.92747 2.75 11.9985 2.75C14.0696 2.75 15.7485 4.42893 15.7485 6.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

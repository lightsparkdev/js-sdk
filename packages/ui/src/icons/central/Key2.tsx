import { type PathProps } from "../types.js";

export function Key2({
  strokeWidth = "2",
  strokeLinecap = "round",
  strokeLinejoin = "round",
}: PathProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M15.5 14.25C18.6756 14.25 21.25 11.6756 21.25 8.5C21.25 5.32436 18.6756 2.75 15.5 2.75C12.3244 2.75 9.75 5.32436 9.75 8.5C9.75 8.98191 9.80928 9.44996 9.92095 9.89728L4.04289 15.7753C3.85536 15.9629 3.75 16.2172 3.75 16.4825V19.2501C3.75 19.8023 4.19772 20.2501 4.75 20.2501H7.5176C7.78282 20.2501 8.03717 20.1447 8.22471 19.9572L9.25 18.9319V16.2501H11.9318L14.1028 14.0791C14.5501 14.1907 15.0181 14.25 15.5 14.25Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M17.25 8.5C17.25 9.4665 16.4665 10.25 15.5 10.25C14.5335 10.25 13.75 9.4665 13.75 8.5C13.75 7.5335 14.5335 6.75 15.5 6.75C16.4665 6.75 17.25 7.5335 17.25 8.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
    </svg>
  );
}

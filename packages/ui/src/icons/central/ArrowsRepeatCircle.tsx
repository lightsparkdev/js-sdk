import { type PathProps } from "../types.js";

export function ArrowsRepeatCircle({
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
        d="M11 2L14 5L11 8"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M13 16L10 19L13 22"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M19.7142 6.40117C19.3277 6.00671 18.6946 6.00029 18.3001 6.38683C17.9056 6.77338 17.8992 7.40651 18.2858 7.80097L19.7142 6.40117ZM14 19.0001V18.0001H11V19.0001V20.0001H14V19.0001ZM21 12.0001H20C20 15.3138 17.3137 18.0001 14 18.0001V19.0001V20.0001C18.4183 20.0001 22 16.4183 22 12.0001H21ZM21 12.0001H22C22 9.82062 21.1272 7.84305 19.7142 6.40117L19 7.10107L18.2858 7.80097C19.3472 8.88417 20 10.3649 20 12.0001H21Z"
        fill="currentColor"
      />
      <path
        d="M13 5H10C6.13401 5 3 8.13401 3 12C3 13.9073 3.76281 15.6364 5 16.899"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
      />
    </svg>
  );
}

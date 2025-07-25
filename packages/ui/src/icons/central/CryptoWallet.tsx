import { type PathProps } from "../types.js";

export function CryptoWallet({
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
        d="M6 13.75L9 15.5V19L6 20.75L3 19V15.5L6 13.75Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M4 6.5C4 5.11929 5.11929 4 6.5 4H16V9M4 6.5C4 7.88071 5.11929 9 6.5 9H16M4 6.5V10.5M16 9H20V20H13"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M15.5 14.5H15.51M15.75 14.5C15.75 14.6381 15.6381 14.75 15.5 14.75C15.3619 14.75 15.25 14.6381 15.25 14.5C15.25 14.3619 15.3619 14.25 15.5 14.25C15.6381 14.25 15.75 14.3619 15.75 14.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}

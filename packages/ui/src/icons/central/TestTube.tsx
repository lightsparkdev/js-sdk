import { type PathProps } from "../types.js";

export function TestTube({
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
        d="M14.0039 5L4.00077 15C2.61969 16.3806 2.61951 18.6195 4.00038 20.0004C5.38094 21.381 7.61921 21.3811 8.99999 20.0008L19.0039 10M14.0039 5L19.0039 10M14.0039 5L13 4M19.0039 10L20 11"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M6.75 13H15.25"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M20 6H20.01"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M19 2.5C19 2.77614 18.7761 3 18.5 3C18.2239 3 18 2.77614 18 2.5C18 2.22386 18.2239 2 18.5 2C18.7761 2 19 2.22386 19 2.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
      <path
        d="M18.3984 2.5H18.5984"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
      />
    </svg>
  );
}
